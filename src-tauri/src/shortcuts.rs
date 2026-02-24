use tauri::AppHandle;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
};

use crate::window;

pub fn register(app: &AppHandle) -> Result<(), tauri_plugin_global_shortcut::Error> {
    let shortcut = Shortcut::new(Some(Modifiers::SHIFT), Code::Space);

    app.global_shortcut().on_shortcut(shortcut, |app, _shortcut, event| {
        if event.state != ShortcutState::Pressed {
            return;
        }

        if let Err(error) = window::toggle_main_window(app) {
            log::error!("failed to toggle window from global shortcut: {error}");
        }
    })
}
