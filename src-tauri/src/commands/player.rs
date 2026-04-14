use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub async fn launch_ani_cli(
    app: tauri::AppHandle,
    slug: String,
    episode: u32,
    quality: String,
    dub: bool,
) -> Result<(), String> {
    let mut args = vec![slug.clone(), "-e".to_string(), episode.to_string(), "-q".to_string(), quality];
    if dub {
        args.push("--dub".to_string());
    }
    app.shell()
        .command("ani-cli")
        .args(args)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
#[allow(unused_variables)]
pub async fn download_episode(slug: String, episode: u32, dir: String) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
#[allow(unused_variables)]
pub async fn download_anime(slug: String, episodes: Vec<u32>, dir: String) -> Result<(), String> {
    Ok(())
}
