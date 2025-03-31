use std::sync::{Arc, Mutex};
use tauri::AppHandle;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

#[derive(Default)]
pub struct ServerState {
    pub child: Option<CommandChild>,
}

#[tauri::command]
pub async fn start_server(
    app: AppHandle,
    state: tauri::State<'_, Arc<Mutex<ServerState>>>,
) -> Result<(), String> {
    let mut server = state.lock().unwrap();

    if server.child.is_some() {
        return Ok(()); 
    }

    let (mut _events, child) = app
        .shell()
        .sidecar("pyright-server")
        .map_err(|e| format!("Failed to create sidecar: {}", e))?
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

    server.child = Some(child);
    Ok(())
}
