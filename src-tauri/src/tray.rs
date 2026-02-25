use tauri::menu::{MenuBuilder, MenuItemBuilder};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

use crate::window;

pub fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let show_main_item = MenuItemBuilder::with_id("show_main", "Afficher fenêtre principale").build(app)?;
    let toggle_overlay_item = MenuItemBuilder::with_id("toggle_overlay", "Afficher / Masquer overlay").build(app)?;
    let quit_item = MenuItemBuilder::with_id("quit", "Quitter").build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&show_main_item)
        .item(&toggle_overlay_item)
        .item(&quit_item)
        .build()?;

    let mut tray_builder = TrayIconBuilder::new()
        .icon_as_template(cfg!(target_os = "macos"))
        .tooltip("ToDo Overlay")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show_main" => {
                if let Err(error) = window::show_main_window(app) {
                    log::error!("failed to show main window from tray menu: {error}");
                }
            }
            "toggle_overlay" => {
                if let Err(error) = window::toggle_overlay(app) {
                    log::error!("failed to toggle overlay from tray menu: {error}");
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
                if let Err(error) = window::toggle_overlay(tray.app_handle()) {
                    log::error!("failed to toggle overlay from tray click: {error}");
                }
            }
        });

    if let Some(icon) = app.default_window_icon().cloned() {
        tray_builder = tray_builder.icon(icon);
    }

    tray_builder.build(app)?;

    Ok(())
}
