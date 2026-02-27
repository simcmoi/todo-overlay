use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

const MAIN_WINDOW_LABEL: &str = "main";
const OVERLAY_WINDOW_LABEL: &str = "overlay";
const BACKDROP_WINDOW_LABEL: &str = "backdrop";

fn get_main_window(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    app.get_webview_window(MAIN_WINDOW_LABEL)
        .ok_or_else(|| tauri::Error::AssetNotFound(MAIN_WINDOW_LABEL.to_string()))
}

fn get_overlay_window(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window(OVERLAY_WINDOW_LABEL)
}

fn get_backdrop_window(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window(BACKDROP_WINDOW_LABEL)
}

fn create_backdrop_window(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    // Create a fullscreen transparent window with blur effect
    let window = WebviewWindowBuilder::new(app, BACKDROP_WINDOW_LABEL, WebviewUrl::App("backdrop.html".into()))
        .title("BlinkDo Backdrop")
        .fullscreen(true)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .decorations(false)
        .transparent(true)
        .shadow(false)
        .always_on_top(false) // Backdrop should be below overlay
        .skip_taskbar(true)
        .visible(false)
        .focused(false)
        .build()?;

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSMainMenuWindowLevel, NSWindow};
        use cocoa::base::id;

        // Set backdrop window level just below overlay
        match window.ns_window() {
            Ok(handle) => {
                let ns_window = handle as id;
                unsafe {
                    // NSFloatingWindowLevel + 1 (level 23, one below overlay's 24)
                    ns_window.setLevel_((NSMainMenuWindowLevel + 1) as i64);
                    
                    log::info!("Backdrop window created at level 23");
                }
            }
            Err(error) => {
                log::warn!("Failed to configure backdrop window: {error}");
            }
        }
    }

    Ok(window)
}

fn create_overlay_window(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    let window = WebviewWindowBuilder::new(app, OVERLAY_WINDOW_LABEL, WebviewUrl::default())
        .title("BlinkDo")
        .inner_size(500.0, 700.0)
        .min_inner_size(500.0, 400.0)
        .resizable(true)
        .maximizable(false)
        .minimizable(false)
        .decorations(false)
        .transparent(true)
        .shadow(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .center()
        .focused(false)
        .build()?;

    Ok(window)
}

pub fn set_overlay_visor_effect(app: &AppHandle, enabled: bool) -> tauri::Result<()> {
    if enabled {
        show_backdrop_window(app)?;
    } else {
        hide_backdrop_window(app)?;
    }
    Ok(())
}

fn show_backdrop_window(app: &AppHandle) -> tauri::Result<()> {
    let backdrop = match get_backdrop_window(app) {
        Some(win) => win,
        None => create_backdrop_window(app)?,
    };

    if !backdrop.is_visible()? {
        backdrop.show()?;
        log::info!("Backdrop window shown");
    }

    Ok(())
}

fn hide_backdrop_window(app: &AppHandle) -> tauri::Result<()> {
    if let Some(backdrop) = get_backdrop_window(app) {
        if backdrop.is_visible()? {
            backdrop.hide()?;
            log::info!("Backdrop window hidden");
        }
    }
    Ok(())
}

pub fn setup_window_close_handlers(app: &AppHandle) -> tauri::Result<()> {
    if let Ok(main_window) = get_main_window(app) {
        let window_clone = main_window.clone();
        main_window.on_window_event(move |event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Prevent the main window from closing, hide it instead
                api.prevent_close();
                if let Err(error) = window_clone.hide() {
                    log::error!("failed to hide main window on close: {error}");
                }
            }
        });
    }

    Ok(())
}

pub fn hide_main_window(app: &AppHandle) -> tauri::Result<()> {
    let window = get_main_window(app)?;

    if window.is_visible()? {
        window.hide()?;
    }

    Ok(())
}

pub fn show_main_window(app: &AppHandle) -> tauri::Result<()> {
    let window = get_main_window(app)?;

    if !window.is_visible()? {
        window.show()?;
        window.set_focus()?;
    }

    Ok(())
}

pub fn show_overlay_window(app: &AppHandle) -> tauri::Result<()> {
    // Check if blur is enabled and show backdrop if needed
    let state = app.state::<crate::storage::AppState>();
    let enable_blur = state
        .data
        .lock()
        .map(|guard| guard.settings.enable_overlay_blur)
        .unwrap_or(false);

    if enable_blur {
        show_backdrop_window(app)?;
    }

    let overlay = match get_overlay_window(app) {
        Some(win) => win,
        None => create_overlay_window(app)?,
    };

    // Set window to float above fullscreen apps on macOS
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSMainMenuWindowLevel, NSWindow};
        use cocoa::base::id;

        match overlay.ns_window() {
            Ok(handle) => {
                let ns_window = handle as id;
                unsafe {
                    // NSFloatingWindowLevel = NSMainMenuWindowLevel + 2 (level 24)
                    // This makes the window float above fullscreen apps
                    ns_window.setLevel_((NSMainMenuWindowLevel + 2) as i64);
                }
            }
            Err(error) => {
                log::warn!("Failed to get NSWindow handle for overlay window: {error}");
            }
        }
    }

    overlay.set_always_on_top(true)?;
    overlay.set_skip_taskbar(true)?;
    overlay.center()?;
    overlay.show()?;
    overlay.set_focus()?;

    Ok(())
}

pub fn toggle_overlay(app: &AppHandle) -> tauri::Result<()> {
    // Hide main window if visible
    if let Ok(main) = get_main_window(app) {
        if main.is_visible()? {
            main.hide()?;
        }
    }

    // Toggle overlay
    let overlay = match get_overlay_window(app) {
        Some(win) => win,
        None => create_overlay_window(app)?,
    };

    if overlay.is_visible()? {
        overlay.hide()?;
        // Also hide backdrop when hiding overlay
        hide_backdrop_window(app)?;
    } else {
        show_overlay_window(app)?;
    }

    Ok(())
}
