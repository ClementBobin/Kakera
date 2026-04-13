use crate::models::AppSettings;

#[tauri::command]
pub async fn get_settings() -> Result<AppSettings, String> {
    // TODO: load settings from persistent storage
    Ok(AppSettings {
        theme: "dark".to_string(),
        theme_preset: "slate".to_string(),
        download_directory: String::new(),
        default_quality: "1080p".to_string(),
        anilist_token: None,
        mal_token: None,
        kitsu_token: None,
        view_mode: "grid".to_string(),
        grid_density: "normal".to_string(),
    })
}

#[tauri::command]
#[allow(unused_variables)]
pub async fn save_settings(settings: AppSettings) -> Result<(), String> {
    // TODO: persist settings to storage
    Ok(())
}
