use serde_json::Value;

#[tauri::command]
pub async fn get_library() -> Result<Vec<Value>, String> {
    Ok(Vec::new())
}

#[tauri::command]
#[allow(unused_variables)]
pub async fn sync_library(service: String) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
#[allow(unused_variables)]
pub async fn sync_category(category: String) -> Result<(), String> {
    Ok(())
}
