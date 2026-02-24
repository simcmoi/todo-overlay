use serde::Deserialize;
use tauri::{AppHandle, State};
use uuid::Uuid;

use crate::storage::{now_millis, persist, AppData, AppState, Settings, Todo};
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

fn push_todo(
    state: &State<'_, AppState>,
    title: String,
    details: Option<String>,
    reminder_at: Option<i64>,
) -> Result<(), String> {
    let trimmed_title = title.trim();
    if trimmed_title.is_empty() {
        return Ok(());
    }

    let normalized_details = normalize_optional_text(details);

    let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
    guard.todos.push(Todo {
        id: Uuid::new_v4().to_string(),
        title: trimmed_title.to_string(),
        details: normalized_details,
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
    push_todo(&state, text, None, None)?;
    persist_state(&app, &state)
}

#[tauri::command]
pub fn create_todo(
    title: String,
    details: Option<String>,
    reminder_at: Option<i64>,
    app: AppHandle,
    state: State<'_, AppState>,
) -> Result<AppData, String> {
    push_todo(&state, title, details, reminder_at)?;
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
    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;

        if let Some(todo) = guard.todos.iter_mut().find(|todo| todo.id == id) {
            todo.completed_at = Some(now_millis());
        }
    }

    {
        let mut notified_guard = state
            .notified_todos
            .lock()
            .map_err(|_| lock_error("reminder"))?;
        notified_guard.remove(&id);
    }

    persist_state(&app, &state)
}

#[tauri::command]
pub fn delete_todo(id: String, app: AppHandle, state: State<'_, AppState>) -> Result<AppData, String> {
    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        guard.todos.retain(|todo| todo.id != id);
    }

    {
        let mut notified_guard = state
            .notified_todos
            .lock()
            .map_err(|_| lock_error("reminder"))?;
        notified_guard.remove(&id);
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
    {
        let mut guard = state.data.lock().map_err(|_| lock_error("todo"))?;
        guard.settings = settings;
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
