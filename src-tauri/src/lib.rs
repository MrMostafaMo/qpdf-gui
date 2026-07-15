mod commands;
mod models;
mod services;
mod utils;

use std::sync::OnceLock;
pub(crate) static APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .setup(|app| {
            APP_HANDLE.set(app.handle().clone()).ok();
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_pdf_info,
            commands::extract_pages,
            commands::merge_pdfs,
            commands::split_pdf,
            commands::rotate_pages,
            commands::delete_pages,
            commands::encrypt_pdf,
            commands::decrypt_pdf,
            commands::optimize_pdf,
            commands::linearize_pdf,
            commands::batch_process,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
