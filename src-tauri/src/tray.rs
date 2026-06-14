use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, WindowEvent,
};

pub fn build_app_menu(app: &AppHandle) -> tauri::Result<Menu<tauri::Wry>> {
    let open = MenuItem::with_id(app, "open", "Open…", true, Some("Ctrl+O"))?;
    let export_pdf = MenuItem::with_id(app, "export_pdf", "Export to PDF", true, Some("Ctrl+Shift+E"))?;
    let quit = PredefinedMenuItem::quit(app, Some("Quit"))?;

    let file_menu = Submenu::with_items(app, "File", true, &[&open, &export_pdf, &quit])?;

    let layout_split = MenuItem::with_id(app, "layout_split", "Split View", true, None)?;
    let layout_focus = MenuItem::with_id(app, "layout_focus", "Focus Mode", true, None)?;
    let layout_preview = MenuItem::with_id(app, "layout_preview", "Preview Only", true, None)?;
    let view_menu = Submenu::with_items(
        app,
        "View",
        true,
        &[&layout_split, &layout_focus, &layout_preview],
    )?;

    let settings = MenuItem::with_id(app, "settings", "Settings…", true, Some("Ctrl+,"))?;
    let check_updates =
        MenuItem::with_id(app, "check_updates", "Check for Updates", true, None)?;
    let help_menu = Submenu::with_items(app, "Help", true, &[&settings, &check_updates])?;

    Menu::with_items(app, &[&file_menu, &view_menu, &help_menu])
}

pub fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "tray_show", "Show FileForge", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "tray_quit", "Quit", true, None::<&str>)?;
    let tray_menu = Menu::with_items(app, &[&show, &quit])?;

    let _tray = TrayIconBuilder::new()
        .menu(&tray_menu)
        .tooltip("FileForge")
        .on_menu_event(|app, event| match event.id.as_ref() {
            "tray_show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "tray_quit" => {
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
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

    Ok(())
}

pub fn handle_window_event(window: &tauri::WebviewWindow, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { api, .. } = event {
        api.prevent_close();
        let _ = window.hide();
    }
}

pub fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    let _ = app.emit("menu-action", event.id.as_ref());
}
