// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;
use crate::commands::server_commands::ServerState;
use std::sync::Arc;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(Arc::new(Mutex::new(ServerState::default())))
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            #[cfg(debug_assertions)]
            {
                window.open_devtools();
            }
            let state = app.state::<Arc<Mutex<ServerState>>>().clone();

            let result = tauri::async_runtime::block_on(commands::server_commands::start_server(
                app.handle().clone(),
                state,
            ));

            match result {
                Ok(_) => println!("start_server success"),
                Err(e) => eprintln!("start_server failed: {}", e),
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let state = window.state::<Arc<Mutex<ServerState>>>().clone();
                let mut server = state.lock().unwrap();
                if let Some(child) = server.child.take() {
                    let _ = child.kill();
                    println!("server terminated");
                }
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::server_commands::start_server,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
