use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnimeEntry {
    pub id: String,
    pub title_romaji: String,
    pub title_english: Option<String>,
    pub title_native: String,
    pub cover_image: String,
    pub banner_image: Option<String>,
    pub status: String,
    pub progress: u32,
    pub total_episodes: Option<u32>,
    pub score: Option<f32>,
    pub is_favorite: bool,
    pub is_downloaded: bool,
    pub downloaded_episodes: Vec<u32>,
    pub last_watched: Option<String>,
    pub last_updated: String,
    pub added_at: String,
    pub genres: Vec<String>,
    pub studios: Vec<String>,
    pub season: Option<String>,
    pub season_year: Option<i32>,
    pub format: String,
    pub source: String,
    pub local_path: Option<String>,
    pub language: Option<String>,
}
