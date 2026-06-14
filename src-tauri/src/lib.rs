mod pdf;
mod tray;

use pdf::generate_pdf_from_html;
use tauri::Manager;

#[tauri::command]
fn generate_pdf(html: String) -> Result<Vec<u8>, pdf::PdfError> {
    generate_pdf_from_html(&html)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(tauri::generate_handler![generate_pdf])
        .setup(|app| {
            let menu = tray::build_app_menu(app.handle())?;
            app.set_menu(menu)?;

            tray::setup_tray(app.handle())?;

            if let Some(window) = app.get_webview_window("main") {
                let window_clone = window.clone();
                window.on_window_event(move |event| {
                    tray::handle_window_event(&window_clone, event);
                });
            }

            Ok(())
        })
        .on_menu_event(|app, event| {
            tray::handle_menu_event(app, event);
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
