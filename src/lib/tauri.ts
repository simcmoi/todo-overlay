import { invoke } from '@tauri-apps/api/core'
import type { AppData, Settings } from '@/types/todo'

export async function loadState(): Promise<AppData> {
  return invoke<AppData>('load_state')
}

export async function addTodo(text: string): Promise<AppData> {
  return invoke<AppData>('add_todo', { text })
}

export async function createTodo(
  title: string,
  details: string | undefined,
  reminderAt: number | undefined,
): Promise<AppData> {
  return invoke<AppData>('create_todo', {
    title,
    details: details ?? null,
    reminderAt: reminderAt ?? null,
  })
}

export async function updateTodo(
  id: string,
  title: string,
  details: string | undefined,
  reminderAt: number | undefined,
): Promise<AppData> {
  return invoke<AppData>('update_todo', {
    payload: {
      id,
      title,
      details: details ?? null,
      reminderAt: reminderAt ?? null,
    },
  })
}

export async function completeTodo(id: string): Promise<AppData> {
  return invoke<AppData>('complete_todo', { id })
}

export async function deleteTodo(id: string): Promise<AppData> {
  return invoke<AppData>('delete_todo', { id })
}

export async function clearHistory(): Promise<AppData> {
  return invoke<AppData>('clear_history')
}

export async function updateSettings(settings: Settings): Promise<AppData> {
  return invoke<AppData>('update_settings', { settings })
}

export async function setTodoReminder(
  id: string,
  reminderAt: number | undefined,
): Promise<AppData> {
  return invoke<AppData>('set_todo_reminder', { id, reminderAt: reminderAt ?? null })
}

export async function hideOverlay(): Promise<void> {
  await invoke('hide_overlay')
}
