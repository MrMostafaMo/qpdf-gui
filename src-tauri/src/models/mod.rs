use serde::{Deserialize, Serialize};
use std::path::Path;

use crate::utils::{AppError, AppResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdfInfo {
    pub file_path: String,
    pub file_name: String,
    pub file_size: u64,
    pub page_count: u32,
    pub is_encrypted: bool,
    pub title: Option<String>,
    pub author: Option<String>,
    pub creation_date: Option<String>,
    pub creator: Option<String>,
    pub producer: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OperationResult {
    pub success: bool,
    pub message: String,
    pub output_path: Option<String>,
}

impl PdfInfo {
    pub fn from_path(path: &str) -> AppResult<Self> {
        let p = Path::new(path);
        if !p.exists() {
            return Err(AppError::FileNotFound(path.to_string()));
        }
        if !path.to_lowercase().ends_with(".pdf") {
            return Err(AppError::InvalidRequest("Not a PDF file".to_string()));
        }

        let metadata = std::fs::metadata(p)?;
        let file_name = p
            .file_name()
            .map(|n| n.to_string_lossy().to_string())
            .unwrap_or_default();

        Ok(Self {
            file_path: path.to_string(),
            file_name,
            file_size: metadata.len(),
            page_count: 0,
            is_encrypted: false,
            title: None,
            author: None,
            creation_date: None,
            creator: None,
            producer: None,
        })
    }
}
