use std::path::PathBuf;

use crate::models::PdfInfo;
use crate::services::qpdf::QpdfService;
use crate::utils::{AppError, AppResult};

/// Validate that a page range string contains only digits, hyphens, commas, and spaces.
/// Rejects page 0 (PDFs are 1-indexed), reversed ranges, and path traversal characters.
fn validate_page_range(pages: &str) -> AppResult<()> {
    if pages.trim().is_empty() {
        return Err(AppError::InvalidRequest(
            "Page range is empty".to_string(),
        ));
    }
    for part in pages.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }
        for ch in part.chars() {
            if !ch.is_ascii_digit() && ch != '-' && ch != ' ' {
                return Err(AppError::InvalidRequest(
                    format!("Invalid character '{ch}' in page range"),
                ));
            }
        }
        let dash_count = part.chars().filter(|&c| c == '-').count();
        if dash_count > 1 {
            return Err(AppError::InvalidRequest(
                format!("Invalid range: {part} (multiple dashes)"),
            ));
        }
        let tokens: Vec<&str> = part.split('-').map(|t| t.trim()).filter(|t| !t.is_empty()).collect();
        if tokens.is_empty() {
            continue;
        }
        let mut nums: Vec<u32> = Vec::new();
        for token in &tokens {
            let num: u32 = token.parse().map_err(|_| {
                AppError::InvalidRequest(format!("Invalid page number: {token}"))
            })?;
            if num == 0 {
                return Err(AppError::InvalidRequest(
                    "Page 0 is invalid; PDFs are 1-indexed".to_string(),
                ));
            }
            nums.push(num);
        }
        if nums.len() == 2 && nums[0] > nums[1] {
            return Err(AppError::InvalidRequest(
                format!("Reversed range: {part}"),
            ));
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_pdf_info(file_path: String) -> AppResult<PdfInfo> {
    QpdfService::get_pdf_info(&file_path)
}

#[tauri::command]
pub fn extract_pages(
    file_path: String,
    pages: String,
    output_path: String,
) -> AppResult<crate::models::OperationResult> {
    validate_page_range(&pages)?;
    QpdfService::extract_pages(&file_path, &pages, &output_path)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: format!("Extracted pages {pages} to {output_path}"),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn merge_pdfs(
    file_paths: Vec<String>,
    output_path: String,
) -> AppResult<crate::models::OperationResult> {
    let count = file_paths.len();
    QpdfService::merge_pdfs(&file_paths, &output_path)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: format!("Merged {count} files to {output_path}"),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn split_pdf(
    file_path: String,
    output_dir: String,
    mode: String,
    ranges: Option<String>,
    interval: Option<u32>,
) -> AppResult<crate::models::OperationResult> {
    match mode.as_str() {
        "ranges" => {
            let ranges_str = ranges.unwrap_or_default();
            let mut created = false;
            std::fs::create_dir_all(&output_dir)?;
            for range in ranges_str.split(',') {
                let range = range.trim();
                if !range.is_empty() {
                    // Reject path traversal characters
                    if range.contains('/') || range.contains('\\') || range.contains("..") {
                        return Err(AppError::InvalidRequest(
                            format!("Invalid range: {range}"),
                        ));
                    }
                    validate_page_range(range)?;
                    let out = PathBuf::from(&output_dir).join(format!("{range}.pdf"));
                    QpdfService::extract_pages(&file_path, range, &out.to_string_lossy())?;
                    created = true;
                }
            }
            if !created {
                return Err(AppError::InvalidRequest(
                    "No valid page ranges provided".to_string(),
                ));
            }
        }
        "every" => {
            let interval = interval.unwrap_or(1).max(1);
            let page_count = QpdfService::get_page_count(&file_path)?;
            std::fs::create_dir_all(&output_dir)?;
            let mut start: u32 = 1;
            let mut chunk = 1;
            while start <= page_count {
                let end = (start as u64 + interval as u64 - 1).min(page_count as u64) as u32;
                let range = format!("{start}-{end}");
                let out = PathBuf::from(&output_dir).join(format!("pages_{chunk}.pdf"));
                QpdfService::extract_pages(&file_path, &range, &out.to_string_lossy())?;
                start = end + 1;
                chunk += 1;
            }
        }
        _ => {
            return Err(crate::utils::AppError::InvalidRequest(
                format!("Unknown split mode: {mode}"),
            ));
        }
    }

    Ok(crate::models::OperationResult {
        success: true,
        message: format!("Split file into parts in {output_dir}"),
        output_path: Some(output_dir),
    })
}

#[tauri::command]
pub fn rotate_pages(
    file_path: String,
    pages: String,
    angle: u32,
    output_path: String,
) -> AppResult<crate::models::OperationResult> {
    if !matches!(angle, 90 | 180 | 270) {
        return Err(crate::utils::AppError::InvalidRequest(
            format!("Invalid angle: {angle}. Must be 90, 180, or 270"),
        ));
    }
    validate_page_range(&pages)?;
    QpdfService::rotate_pages(&file_path, &pages, angle, &output_path)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: format!("Rotated pages {pages} by {angle}°"),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn delete_pages(
    file_path: String,
    pages: String,
    output_path: String,
) -> AppResult<crate::models::OperationResult> {
    validate_page_range(&pages)?;
    QpdfService::delete_pages(&file_path, &pages, &output_path)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: format!("Deleted pages {pages}"),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn encrypt_pdf(
    file_path: String,
    output_path: String,
    owner_password: String,
    user_password: String,
    key_length: u32,
) -> AppResult<crate::models::OperationResult> {
    if owner_password.is_empty() || user_password.is_empty() {
        return Err(AppError::InvalidRequest(
            "Passwords cannot be empty".to_string(),
        ));
    }
    QpdfService::encrypt_pdf(&file_path, &output_path, &owner_password, &user_password, key_length)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: "PDF encrypted successfully".to_string(),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn decrypt_pdf(
    file_path: String,
    output_path: String,
    password: String,
) -> AppResult<crate::models::OperationResult> {
    if password.is_empty() {
        return Err(AppError::InvalidRequest(
            "Password cannot be empty".to_string(),
        ));
    }
    QpdfService::decrypt_pdf(&file_path, &output_path, &password)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: "PDF decrypted successfully".to_string(),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn optimize_pdf(
    file_path: String,
    output_path: String,
    level: String,
) -> AppResult<crate::models::OperationResult> {
    QpdfService::optimize_pdf(&file_path, &output_path, &level)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: format!("PDF optimized at {level} level"),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn linearize_pdf(
    file_path: String,
    output_path: String,
) -> AppResult<crate::models::OperationResult> {
    QpdfService::linearize_pdf(&file_path, &output_path)?;
    Ok(crate::models::OperationResult {
        success: true,
        message: "PDF linearized successfully".to_string(),
        output_path: Some(output_path),
    })
}

#[tauri::command]
pub fn batch_process(
    input_dir: String,
    output_dir: String,
    operation: String,
) -> AppResult<crate::models::OperationResult> {
    let input_path = std::path::Path::new(&input_dir);
    if !input_path.is_dir() {
        return Err(crate::utils::AppError::InvalidRequest(
            format!("Input path is not a directory: {input_dir}"),
        ));
    }

    std::fs::create_dir_all(&output_dir)?;

    let mut processed = 0u32;
    let mut errors = Vec::new();

    for entry in std::fs::read_dir(input_path)? {
        let entry = entry?;
        let path = entry.path();
        let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
        if ext.to_lowercase() != "pdf" {
            continue;
        }

        let Some(file_name) = path.file_name().map(|n| n.to_string_lossy().to_string()) else {
            continue;
        };
        let Some(stem) = path.file_stem().map(|n| n.to_string_lossy().to_string()) else {
            continue;
        };

        let result = match operation.as_str() {
            "optimize" => {
                let out = PathBuf::from(&output_dir).join(format!("{stem}_{operation}.pdf"));
                QpdfService::optimize_pdf(&path.to_string_lossy(), &out.to_string_lossy(), "generalized")
            }
            "linearize" => {
                let out = PathBuf::from(&output_dir).join(format!("{stem}_{operation}.pdf"));
                QpdfService::linearize_pdf(&path.to_string_lossy(), &out.to_string_lossy())
            }
            _ => {
                errors.push(format!("Unknown operation: {operation}"));
                continue;
            }
        };

        match result {
            Ok(()) => processed += 1,
            Err(e) => errors.push(format!("{file_name}: {e}")),
        }
    }

    let msg = if errors.is_empty() {
        format!("Processed {processed} files")
    } else {
        format!("Processed {processed} files, {} errors", errors.len())
    };

    Ok(crate::models::OperationResult {
        success: errors.is_empty(),
        message: msg,
        output_path: Some(output_dir),
    })
}
