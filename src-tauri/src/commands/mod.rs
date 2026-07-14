use crate::models::PdfInfo;
use crate::services::qpdf::QpdfService;
use crate::utils::AppResult;

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
            // Split by comma-separated ranges, create separate files
            for range in ranges_str.split(',') {
                let range = range.trim();
                if !range.is_empty() {
                    let out = format!("{output_dir}/{range}.pdf");
                    std::fs::create_dir_all(&output_dir)?;
                    QpdfService::extract_pages(&file_path, range, &out)?;
                }
            }
        }
        "every" => {
            let interval = interval.unwrap_or(1);
            let page_count = QpdfService::get_page_count(&file_path)?;
            std::fs::create_dir_all(&output_dir)?;
            let mut start = 1;
            let mut chunk = 1;
            while start <= page_count {
                let end = std::cmp::min(start + interval - 1, page_count);
                let range = format!("{start}-{end}");
                let out = format!("{output_dir}/pages_{chunk}.pdf");
                QpdfService::extract_pages(&file_path, &range, &out)?;
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
        if path.extension().and_then(|e| e.to_str()) != Some("pdf") {
            continue;
        }

        let file_name = path.file_name().unwrap().to_string_lossy().to_string();
        let stem = path.file_stem().unwrap().to_string_lossy().to_string();
        let out = format!("{output_dir}/{stem}_{operation}.pdf");

        let result = match operation.as_str() {
            "optimize" => QpdfService::optimize_pdf(
                &path.to_string_lossy(),
                &out,
                "ebook",
            ),
            "linearize" => QpdfService::linearize_pdf(
                &path.to_string_lossy(),
                &out,
            ),
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
