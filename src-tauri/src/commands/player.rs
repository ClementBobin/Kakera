#[tauri::command]
#[allow(unused_variables)]
pub async fn launch_ani_cli(slug: String, episode: u32, quality: String) -> Result<(), String> {
    // TODO: launch ani-cli with the given slug, episode, and quality
    Ok(())
}

#[tauri::command]
#[allow(unused_variables)]
pub async fn download_episode(slug: String, episode: u32, dir: String) -> Result<(), String> {
    // TODO: download the specified episode to the given directory
    Ok(())
}
