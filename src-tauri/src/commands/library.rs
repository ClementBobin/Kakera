use crate::models::AnimeEntry;

#[tauri::command]
pub async fn get_library() -> Result<Vec<AnimeEntry>, String> {
    // TODO: load library from local SQLite database
    Ok(Vec::new())
}

#[tauri::command]
pub async fn sync_library() -> Result<(), String> {
    // TODO: sync with configured tracking services
    Ok(())
}
