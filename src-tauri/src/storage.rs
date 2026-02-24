use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const STORAGE_FILE_NAME: &str = "todos.json";

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
pub struct Todo {
    pub id: String,
    #[serde(default, alias = "text")]
    pub title: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
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
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            sort_order: SortOrder::Desc,
            auto_close_on_blur: true,
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
        Ok(data) => Ok(data),
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
