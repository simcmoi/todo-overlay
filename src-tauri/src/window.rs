use tauri::{AppHandle, Manager, WebviewWindow};

const WINDOW_LABEL: &str = "main";

fn get_main_window(app: &AppHandle) -> tauri::Result<WebviewWindow> {
    app.get_webview_window(WINDOW_LABEL)
        .ok_or_else(|| tauri::Error::AssetNotFound(WINDOW_LABEL.to_string()))
}

pub fn hide_main_window(app: &AppHandle) -> tauri::Result<()> {
    let window = get_main_window(app)?;

    if window.is_visible()? {
        window.hide()?;
    }

    Ok(())
}

pub fn toggle_main_window(app: &AppHandle) -> tauri::Result<()> {
    let window = get_main_window(app)?;

    if window.is_visible()? {
        window.hide()?;
    } else {
        // Set window to float above fullscreen apps on macOS
        #[cfg(target_os = "macos")]
        {
            use cocoa::appkit::{NSMainMenuWindowLevel, NSWindow};
            use cocoa::base::id;
            
            let ns_window = window.ns_window().unwrap() as id;
            unsafe {
                // NSFloatingWindowLevel = NSMainMenuWindowLevel + 2 (level 24)
                // This makes the window float above fullscreen apps
                ns_window.setLevel_((NSMainMenuWindowLevel + 2) as i64);
            }
        }
        
        window.set_always_on_top(true)?;
        window.set_skip_taskbar(true)?;
        window.center()?;
        window.show()?;
        window.set_focus()?;
    }

    Ok(())
}
