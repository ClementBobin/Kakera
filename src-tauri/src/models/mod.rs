use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimeEntry {
    pub id: u64,
    pub title: String,
    pub title_english: Option<String>,
    pub title_romaji: Option<String>,
    pub episodes: Option<u32>,
    pub episodes_watched: u32,
    pub score: Option<f32>,
    pub status: String,
    pub cover_image: Option<String>,
    pub genres: Vec<String>,
    pub is_downloaded: bool,
    pub downloaded_episodes: Vec<u32>,
    pub is_favorite: bool,
    pub service: String,
    pub service_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub theme: String,
    pub theme_preset: String,
    pub download_directory: String,
    pub default_quality: String,
    pub anilist_token: Option<String>,
    pub mal_token: Option<String>,
    pub kitsu_token: Option<String>,
    pub view_mode: String,
    pub grid_density: String,
}
