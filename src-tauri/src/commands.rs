use serde::Deserialize;
use std::collections::{HashMap, HashSet};
use tauri::{AppHandle, State};
use uuid::Uuid;

use crate::storage::{now_millis, persist, AppData, AppState, Settings, Todo, TodoList, DEFAULT_LIST_ID};
use crate::window;

fn lock_error(name: &str) -> String {
    format!("failed to lock {name} state")
}

fn persist_state(app: &AppHandle, state: &State<'_, AppState>) -> Result<AppData, String> {
    let snapshot = state.data.lock().map_err(|_| lock_error("todo"))?.clone();
    persist(app, &snapshot)?;
    Ok(snapshot)
}

fn normalize_optional_text(value: Option<String>) -> Option<String> {
    value.and_then(|raw| {
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

fn normalize_optional_id(value: Option<String>) -> Option<String> {
    value.and_then(|raw| {
        let trimmed = raw.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_string())
        }
    })
}

fn normalize_list_name(value: &str, fallback: &str) -> String {
    let trimmed = value.trim();
    if trimmed.is_empty() {
        fallback.to_string()
    } else {
        trimmed.to_string()
    }
}

fn sanitize_settings(mut settings: Settings) -> Settings {
    if settings.lists.is_empty() {
        settings.lists.push(TodoList {
            id: DEFAULT_LIST_ID.to_string(),
            name: "Mes tâches".to_string(),
            created_at: now_millis(),
        });
    }

    for (index, list) in settings.lists.iter_mut().enumerate() {
        list.name = normalize_list_name(
            &list.name,
            if index == 0 { "Mes tâches" } else { "Nouvelle liste" },
        );
    }

    if !settings
        .lists
        .iter()
        .any(|list| list.id == settings.active_list_id)
    {
        settings.active_list_id = settings
            .lists
            .first()
            .map(|list| list.id.clone())
            .unwrap_or_else(|| DEFAULT_LIST_ID.to_string());
    }

    settings.legacy_list_name = None;
    settings
}

fn collect_subtree_ids(todos: &[Todo], root_id: &str) -> HashSet<String> {
    let mut children_by_parent: HashMap<&str, Vec<&str>> = HashMap::new();
    for todo in todos {
        if let Some(parent_id) = todo.parent_id.as_deref() {
            children_by_parent
                .entry(parent_id)
                .or_default()
                .push(todo.id.as_str());
        }
    }

    let mut stack = vec![root_id];
    let mut visited = HashSet::new();

    while let Some(current) = stack.pop() {
        if !visited.insert(current.to_string()) {
            continue;
        }

        if let Some(children) = children_by_parent.get(current) {
            for child_id in children {
                stack.push(child_id);
            }
        }
    }

    visited
}

fn push_todo(
    state: &State<'_, AppState>,
    title: String,
    details: Option<String>,
    reminder_at: Option<i64>,
    parent_id: Option<String>,
    list_id: Option<String>,
) -> Result<(), String> {
    let trimmed_title = title.trim();
    if trimmed_title.is_empty() {
        return Ok(());
    }

    let normalized_details = normalize_optional_text(details);
    let normalized_parent_id = normalize_optional_id(parent_id);
    let normalized_list_id = normalize_optional_id(list_id);

    let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
    let target_list_id = normalized_list_id
        .filter(|candidate| guard.settings.lists.iter().any(|list| list.id == *candidate))
        .unwrap_or_else(|| guard.settings.active_list_id.clone());

    let validated_parent_id = normalized_parent_id.and_then(|candidate_parent| {
        guard
            .todos
            .iter()
            .find(|todo| {
                todo.id == candidate_parent && todo.list_id.as_deref() == Some(target_list_id.as_str())
            })
            .map(|todo| todo.id.clone())
    });

    guard.todos.push(Todo {
        id: Uuid::new_v4().to_string(),
        title: trimmed_title.to_string(),
        details: normalized_details,
        parent_id: validated_parent_id,
        list_id: Some(target_list_id),
        starred: false,
        created_at: now_millis(),
        completed_at: None,
        reminder_at,
    });

    Ok(())
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TodoPatchInput {
    pub id: String,
    pub title: String,
    pub details: Option<String>,
    pub reminder_at: Option<i64>,
}

#[tauri::command]
pub fn load_state(state: State<'_, AppState>) -> AppData {
    state.snapshot()
}

#[tauri::command]
pub fn add_todo(text: String, app: AppHandle, state: State<'_, AppState>) -> Result<AppData, String> {
    push_todo(&state, text, None, None, None, None)?;
    persist_state(&app, &state)
}

#[tauri::command]
pub fn create_todo(
    title: String,
    details: Option<String>,
    reminder_at: Option<i64>,
    parent_id: Option<String>,
    list_id: Option<String>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    push_todo(&state, title, details, reminder_at, parent_id, list_id)?;
    persist_state(&app, &state)
}

#[tauri::command]
pub fn update_todo(
    payload: TodoPatchInput,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    let trimmed_title = payload.title.trim();
    if trimmed_title.is_empty() {
        return persist_state(&app, &state);
    }

    let normalized_details = normalize_optional_text(payload.details);
    let mut should_reset_reminder_notification = false;

    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;

        if let Some(todo) = guard.todos.iter_mut().find(|todo| todo.id == payload.id) {
            should_reset_reminder_notification = todo.reminder_at != payload.reminder_at;
            todo.title = trimmed_title.to_string();
            todo.details = normalized_details;
            todo.reminder_at = payload.reminder_at;
        }
    }

    if should_reset_reminder_notification {
        let mut notified_guard = state
            .notified_todos
            .lock()
            .map_err(|_| lock_error("reminder"))?;
        notified_guard.remove(&payload.id);
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn complete_todo(id: String, app: AppHandle, state: State<'_, AppState>) -> Result<AppData, String> {
    set_todo_completed(id, true, app, state)
}

#[tauri::command]
pub fn set_todo_completed(
    id: String,
    completed: bool,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    let next_completed_at = completed.then_some(now_millis());

    let affected_ids = {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        let ids = collect_subtree_ids(&guard.todos, &id);

        for todo in guard.todos.iter_mut() {
            if ids.contains(&todo.id) {
                todo.completed_at = next_completed_at;
            }
        }
        ids
    };

    if completed && !affected_ids.is_empty() {
        let mut notified_guard = state
            .notified_todos
            .lock()
            .map_err(|_| lock_error("reminder"))?;
        for affected_id in affected_ids {
            notified_guard.remove(&affected_id);
        }
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn set_todo_starred(
    id: String,
    starred: bool,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;

        if let Some(todo) = guard.todos.iter_mut().find(|todo| todo.id == id) {
            todo.starred = starred;
        }
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn create_list(name: String, app: AppHandle, state: State<'_, AppState>) -> Result<AppData, String> {
    let list_name = normalize_list_name(&name, "Nouvelle liste");
    let list_id = Uuid::new_v4().to_string();

    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        guard.settings.lists.push(TodoList {
            id: list_id.clone(),
            name: list_name,
            created_at: now_millis(),
        });
        guard.settings.active_list_id = list_id;
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn rename_list(
    id: String,
    name: String,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    let trimmed_name = name.trim();
    if trimmed_name.is_empty() {
        return persist_state(&app, &state);
    }

    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        if let Some(list) = guard.settings.lists.iter_mut().find(|list| list.id == id) {
            list.name = trimmed_name.to_string();
        }
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn set_active_list(id: String, app: AppHandle, state: State<'_, AppState>) -> Result<AppData, String> {
    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        if guard.settings.lists.iter().any(|list| list.id == id) {
            guard.settings.active_list_id = id;
        }
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn delete_todo(id: String, app: AppHandle, state: State<'_, AppState>) -> Result<AppData, String> {
    let deleted_ids = {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        let mut ids = collect_subtree_ids(&guard.todos, &id);
        if ids.is_empty() {
            ids.insert(id.clone());
        }
        guard.todos.retain(|todo| !ids.contains(&todo.id));
        ids
    };

    {
        let mut notified_guard = state
            .notified_todos
            .lock()
            .map_err(|_| lock_error("reminder"))?;
        for deleted_id in deleted_ids {
            notified_guard.remove(&deleted_id);
        }
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn clear_history(app: AppHandle, state: State<'_, AppState>) -> Result<AppData, String> {
    let completed_ids: Vec<String> = {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;

        let ids = guard
            .todos
            .iter()
            .filter(|todo| todo.completed_at.is_some())
            .map(|todo| todo.id.clone())
            .collect::<Vec<_>>();

        guard.todos.retain(|todo| todo.completed_at.is_none());
        ids
    };

    {
        let mut notified_guard = state
            .notified_todos
            .lock()
            .map_err(|_| lock_error("reminder"))?;
        for id in completed_ids {
            notified_guard.remove(&id);
        }
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn update_settings(
    settings: Settings,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    let sanitized_settings = sanitize_settings(settings);

    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        guard.settings = sanitized_settings;

        let valid_list_ids: HashSet<String> =
            guard.settings.lists.iter().map(|list| list.id.clone()).collect();
        let fallback_list_id = guard.settings.active_list_id.clone();
        for todo in &mut guard.todos {
            match todo.list_id.as_deref() {
                Some(list_id) if valid_list_ids.contains(list_id) => {}
                _ => {
                    todo.list_id = Some(fallback_list_id.clone());
                }
            }
        }
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn set_todo_reminder(
    id: String,
    reminder_at: Option<i64>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    let mut should_reset_reminder_notification = false;

    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;

        if let Some(todo) = guard.todos.iter_mut().find(|todo| todo.id == id) {
            should_reset_reminder_notification = todo.reminder_at != reminder_at;
            todo.reminder_at = reminder_at;
        }
    }

    if should_reset_reminder_notification {
        let mut notified_guard = state
            .notified_todos
            .lock()
            .map_err(|_| lock_error("reminder"))?;
        notified_guard.remove(&id);
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn hide_overlay(app: AppHandle) -> Result<(), String> {
    window::hide_main_window(&app).map_err(|error| error.to_string())
}
