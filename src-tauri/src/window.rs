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
        window.set_always_on_top(true)?;
        window.set_skip_taskbar(true)?;
        window.center()?;
        window.show()?;
        window.set_focus()?;
    }

    Ok(())
}
