use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const STORAGE_FILE_NAME: &str = "todos.json";
pub const DEFAULT_LIST_ID: &str = "default";

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum SortOrder {
    Asc,
    Desc,
}

impl Default for SortOrder {
    fn default() -> Self {
        Self::Desc
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TodoList {
    pub id: String,
    pub name: String,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Todo {
    pub id: String,
    #[serde(default, alias = "text")]
    pub title: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub list_id: Option<String>,
    #[serde(default)]
    pub starred: bool,
    pub created_at: i64,
    pub completed_at: Option<i64>,
    pub reminder_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    #[serde(default)]
    pub sort_order: SortOrder,
    #[serde(default = "default_auto_close_on_blur")]
    pub auto_close_on_blur: bool,
    #[serde(default = "default_lists")]
    pub lists: Vec<TodoList>,
    #[serde(default = "default_active_list_id")]
    pub active_list_id: String,
    #[serde(default, alias = "listName", alias = "list_name", skip_serializing)]
    pub legacy_list_name: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            sort_order: SortOrder::Desc,
            auto_close_on_blur: true,
            lists: default_lists(),
            active_list_id: default_active_list_id(),
            legacy_list_name: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppData {
    #[serde(default)]
    pub settings: Settings,
    #[serde(default)]
    pub todos: Vec<Todo>,
}

pub struct AppState {
    pub data: Mutex<AppData>,
    pub notified_todos: Mutex<HashSet<String>>,
}

impl AppState {
    pub fn new(data: AppData) -> Self {
        Self {
            data: Mutex::new(data),
            notified_todos: Mutex::new(HashSet::new()),
        }
    }

    pub fn snapshot(&self) -> AppData {
        self.data
            .lock()
            .expect("todo state lock poisoned")
            .clone()
    }
}

fn default_auto_close_on_blur() -> bool {
    true
}

fn default_list_name() -> String {
    "Mes tâches".to_string()
}

fn default_active_list_id() -> String {
    DEFAULT_LIST_ID.to_string()
}

fn default_lists() -> Vec<TodoList> {
    vec![TodoList {
        id: default_active_list_id(),
        name: default_list_name(),
        created_at: 0,
    }]
}

fn normalize_name(value: &str, fallback: &str) -> String {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        fallback.to_string()
    } else {
        trimmed.to_string()
    }
}

fn normalize_data(mut data: AppData) -> AppData {
    let mut lists = data.settings.lists.clone();

    if lists.is_empty() {
        let legacy_name = data
            .settings
            .legacy_list_name
            .as_deref()
            .map(|name| normalize_name(name, &default_list_name()))
            .unwrap_or_else(default_list_name);

        lists.push(TodoList {
            id: default_active_list_id(),
            name: legacy_name,
            created_at: now_millis(),
        });
    } else {
        for (index, list) in lists.iter_mut().enumerate() {
            let fallback = if index == 0 {
                "Mes tâches"
            } else {
                "Nouvelle liste"
            };
            list.name = normalize_name(&list.name, fallback);
        }
    }

    let active_list_id = if lists
        .iter()
        .any(|list| list.id == data.settings.active_list_id)
    {
        data.settings.active_list_id.clone()
    } else {
        lists
            .first()
            .map(|list| list.id.clone())
            .unwrap_or_else(default_active_list_id)
    };

    let valid_list_ids: HashSet<String> = lists.iter().map(|list| list.id.clone()).collect();
    for todo in &mut data.todos {
        let fallback_id = active_list_id.clone();
        match todo.list_id.as_deref() {
            Some(list_id) if valid_list_ids.contains(list_id) => {}
            _ => {
                todo.list_id = Some(fallback_id);
            }
        }
    }

    data.settings.lists = lists;
    data.settings.active_list_id = active_list_id;
    data.settings.legacy_list_name = None;
    data
}

fn storage_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("failed to resolve appDataDir: {error}"))?;

    fs::create_dir_all(&app_dir)
        .map_err(|error| format!("failed to create appDataDir directory: {error}"))?;

    Ok(app_dir.join(STORAGE_FILE_NAME))
}

pub fn load_or_create(app: &AppHandle) -> Result<AppData, String> {
    let path = storage_path(app)?;

    if !path.exists() {
        let data = AppData::default();
        persist(app, &data)?;
        return Ok(data);
    }

    let raw = fs::read_to_string(&path)
        .map_err(|error| format!("failed to read storage file {}: {error}", path.display()))?;

    match serde_json::from_str::<AppData>(&raw) {
        Ok(data) => {
            let normalized = normalize_data(data);
            persist(app, &normalized)?;
            Ok(normalized)
        }
        Err(error) => {
            log::warn!(
                "failed to deserialize storage file {}: {error}; resetting with defaults",
                path.display()
            );

            let data = AppData::default();
            persist(app, &data)?;
            Ok(data)
        }
    }
}

pub fn persist(app: &AppHandle, data: &AppData) -> Result<(), String> {
    let path = storage_path(app)?;

    let payload = serde_json::to_string_pretty(data)
        .map_err(|error| format!("failed to serialize storage payload: {error}"))?;

    fs::write(&path, payload)
        .map_err(|error| format!("failed to write storage file {}: {error}", path.display()))
}

pub fn now_millis() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time drifted before unix epoch")
        .as_millis() as i64
}
