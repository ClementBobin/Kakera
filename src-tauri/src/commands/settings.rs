use tauri::Manager;
use std::path::PathBuf;

fn settings_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    Ok(data_dir.join("settings.json"))
}

#[tauri::command]
pub async fn get_settings(app_handle: tauri::AppHandle) -> Result<String, String> {
    let path = settings_path(&app_handle)?;
    if path.exists() {
        std::fs::read_to_string(&path).map_err(|e| e.to_string())
    } else {
        Ok("{}".to_string())
    }
}

#[tauri::command]
#[allow(unused_variables)]
pub async fn save_settings(app_handle: tauri::AppHandle, content: String) -> Result<(), String> {
    let path = settings_path(&app_handle)?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(&path, content).map_err(|e| e.to_string())
}
