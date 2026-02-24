mod commands;
mod reminder;
mod shortcuts;
mod storage;
mod tray;
mod window;

use tauri_plugin_autostart::ManagerExt;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .setup(|app| {
            let app_handle = app.handle().clone();

            let data = storage::load_or_create(&app_handle)
                .map_err(|error| std::io::Error::other(error))?;
            app.manage(storage::AppState::new(data));

            tray::create_tray(&app_handle)?;
            shortcuts::register(&app_handle)?;
            window::hide_main_window(&app_handle)?;

            reminder::start_scheduler(app_handle.clone());

            if let Err(error) = app_handle.autolaunch().enable() {
                log::error!("failed to enable autostart: {error}");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::load_state,
            commands::add_todo,
            commands::create_todo,
            commands::create_list,
            commands::update_todo,
            commands::complete_todo,
            commands::set_todo_completed,
            commands::set_todo_starred,
            commands::rename_list,
            commands::set_active_list,
            commands::delete_todo,
            commands::clear_history,
            commands::update_settings,
            commands::set_todo_reminder,
            commands::hide_overlay
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
