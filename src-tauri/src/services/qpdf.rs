use serde_json::Value;
use std::process::Command;
use tauri::Manager;

use crate::models::PdfInfo;
use crate::utils::{AppError, AppResult};
use crate::APP_HANDLE;

/// Resolve the bundled qpdf binary path and library directories.
/// In production, qpdf binary and shared libraries are in the resource directory.
/// In dev, falls back to bare "qpdf" on PATH.
fn qpdf_command(args: &[&str]) -> Command {
    let bin_name = if cfg!(target_os = "windows") {
        "qpdf.exe"
    } else {
        "qpdf"
    };

    // Try to find bundled binary in the resource directory
    if let Some(handle) = APP_HANDLE.get() {
        if let Ok(resource_dir) = handle.path().resource_dir() {
            let qpdf_path = resource_dir.join(bin_name);
            if qpdf_path.exists() {
                let mut cmd = Command::new(&qpdf_path);
                cmd.args(args);

                // Set library paths for bundled shared libraries
                if cfg!(target_os = "windows") {
                    let mut path = std::env::var("PATH").unwrap_or_default();
                    path.push(';');
                    path.push_str(&resource_dir.to_string_lossy());
                    cmd.env("PATH", &path);
                }
                if cfg!(target_os = "linux") {
                    let lib_dir = resource_dir.join("lib");
                    if lib_dir.exists() {
                        let lib_str = lib_dir.to_string_lossy();
                        let existing = std::env::var("LD_LIBRARY_PATH").unwrap_or_default();
                        let new_path = if existing.is_empty() {
                            lib_str.to_string()
                        } else {
                            format!("{existing}:{lib_str}")
                        };
                        cmd.env("LD_LIBRARY_PATH", &new_path);
                    }
                }
                cmd.current_dir(&resource_dir);
                return cmd;
            }
        }
    }

    // Fallback: bare "qpdf" on PATH (dev mode)
    let mut cmd = Command::new("qpdf");
    cmd.args(args);
    cmd
}

pub struct QpdfService;

impl QpdfService {
    fn run_qpdf(args: &[&str]) -> AppResult<String> {
        let output = qpdf_command(args)
            .output()
            .map_err(|e| AppError::Qpdf(format!("Failed to execute qpdf: {e}")))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AppError::Qpdf(format!("qpdf failed: {stderr}")));
        }

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    pub fn get_page_count(file_path: &str) -> AppResult<u32> {
        let output = Self::run_qpdf(&["--show-npages", file_path])?;
        let count = output.trim().parse::<u32>().map_err(|_| {
            AppError::Qpdf(format!("Invalid page count output: {output}"))
        })?;
        Ok(count)
    }

    pub fn is_encrypted(file_path: &str) -> AppResult<bool> {
        let output = qpdf_command(&["--is-encrypted", file_path])
            .output()
            .map_err(|e| AppError::Qpdf(format!("Failed to execute qpdf: {e}")))?;

        Ok(output.status.success())
    }

    pub fn get_pdf_info(file_path: &str) -> AppResult<PdfInfo> {
        let mut info = PdfInfo::from_path(file_path)?;

        info.page_count = Self::get_page_count(file_path)?;
        info.is_encrypted = Self::is_encrypted(file_path)?;

        // Try to get metadata from qpdf --json
        let json_output = Self::run_qpdf(&["--json", "--json-key", "qpdf", file_path]);
        if let Ok(json_str) = json_output {
            if let Ok(json) = serde_json::from_str::<Value>(&json_str) {
                if let Some(qpdf_arr) = json.get("qpdf").and_then(|v| v.as_array()) {
                    if let Some(first) = qpdf_arr.first() {
                        info.title = first
                            .get("title")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        info.creator = first
                            .get("creator")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        info.producer = first
                            .get("producer")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                    }
                }
            }
        }

        Ok(info)
    }

    pub fn extract_pages(
        file_path: &str,
        pages: &str,
        output_path: &str,
    ) -> AppResult<()> {
        Self::run_qpdf(&[
            file_path,
            "--pages",
            file_path,
            &format!("{pages}"),
            "--",
            output_path,
        ])?;
        Ok(())
    }

    pub fn merge_pdfs(file_paths: &[String], output_path: &str) -> AppResult<()> {
        if file_paths.len() < 2 {
            return Err(AppError::InvalidRequest(
                "Need at least 2 files to merge".to_string(),
            ));
        }

        let mut args: Vec<&str> = Vec::new();
        args.push(&file_paths[0]);
        args.push("--pages");
        for path in &file_paths[1..] {
            args.push(path);
            args.push("");
        }
        args.push("--");
        args.push(output_path);

        Self::run_qpdf(&args)?;
        Ok(())
    }

    pub fn rotate_pages(
        file_path: &str,
        pages: &str,
        angle: u32,
        output_path: &str,
    ) -> AppResult<()> {
        let rotate_arg = format!("--rotate={pages}:{angle}");
        Self::run_qpdf(&[file_path, &rotate_arg, "--", output_path])?;
        Ok(())
    }

    pub fn delete_pages(
        file_path: &str,
        pages: &str,
        output_path: &str,
    ) -> AppResult<()> {
        let page_count = Self::get_page_count(file_path)?;
        let range = format!("1-{page_count},x{pages}");
        Self::run_qpdf(&[
            file_path,
            "--pages",
            file_path,
            &range,
            "--",
            output_path,
        ])?;
        Ok(())
    }

    pub fn encrypt_pdf(
        file_path: &str,
        output_path: &str,
        owner_password: &str,
        user_password: &str,
        key_length: u32,
    ) -> AppResult<()> {
        let key_str = match key_length {
            128 => "128",
            256 => "256",
            _ => "256",
        };

        Self::run_qpdf(&[
            file_path,
            "--encrypt",
            user_password,
            owner_password,
            key_str,
            "--",
            output_path,
        ])?;
        Ok(())
    }

    pub fn decrypt_pdf(
        file_path: &str,
        output_path: &str,
        password: &str,
    ) -> AppResult<()> {
        Self::run_qpdf(&[file_path, "--decrypt", "--password", password, "--", output_path])?;
        Ok(())
    }

    pub fn optimize_pdf(
        file_path: &str,
        output_path: &str,
        level: &str,
    ) -> AppResult<()> {
        let mut args = vec![];
        match level {
            "all" => args.push("--decode-level=all"),
            "generalized" => args.push("--decode-level=generalized"),
            "specialized" => args.push("--decode-level=specialized"),
            "none" => args.push("--decode-level=none"),
            _ => {}
        }
        args.push(file_path);
        args.push("--");
        args.push(output_path);

        Self::run_qpdf(&args)?;
        Ok(())
    }

    pub fn linearize_pdf(file_path: &str, output_path: &str) -> AppResult<()> {
        Self::run_qpdf(&[file_path, "--linearize", "--", output_path])?;
        Ok(())
    }
}
