use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

use crate::window;

pub fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let toggle_item = MenuItemBuilder::with_id("toggle", "Afficher / Masquer").build(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quitter").build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&toggle_item)
        .item(&quit_item)
        .build()?;

    let mut tray_builder = TrayIconBuilder::new()
        .icon_as_template(cfg!(target_os = "macos"))
        .tooltip("ToDo Overlay")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle" => {
                if let Err(error) = window::toggle_main_window(app) {
                    log::error!("failed to toggle window from tray menu: {error}");
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                if let Err(error) = window::toggle_main_window(tray.app_handle()) {
                    log::error!("failed to toggle window from tray click: {error}");
                }
            }
        });

    if let Some(icon) = app.default_window_icon().cloned() {
        tray_builder = tray_builder.icon(icon);
    }

    tray_builder.build(app)?;

    Ok(())
}
