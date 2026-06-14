use std::path::PathBuf;
use std::process::Command;

#[derive(Debug, serde::Serialize)]
#[serde(tag = "code", content = "message")]
pub enum PdfError {
    BrowserNotFound(String),
    PrintFailed(String),
}

impl std::fmt::Display for PdfError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            PdfError::BrowserNotFound(msg) | PdfError::PrintFailed(msg) => write!(f, "{msg}"),
        }
    }
}

pub fn find_browser() -> Option<PathBuf> {
    let candidates: Vec<PathBuf> = if cfg!(target_os = "windows") {
        let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
        vec![
            PathBuf::from(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
            PathBuf::from(r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"),
            PathBuf::from(format!(
                r"{local_app_data}\Google\Chrome\Application\chrome.exe"
            )),
            PathBuf::from(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
            PathBuf::from(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        ]
    } else if cfg!(target_os = "macos") {
        vec![
            PathBuf::from("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
            PathBuf::from("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
            PathBuf::from("/Applications/Chromium.app/Contents/MacOS/Chromium"),
        ]
    } else {
        vec![
            PathBuf::from("/usr/bin/google-chrome"),
            PathBuf::from("/usr/bin/chromium-browser"),
            PathBuf::from("/usr/bin/chromium"),
            PathBuf::from("/usr/bin/microsoft-edge"),
        ]
    };

    if let Ok(custom) = std::env::var("PUPPETEER_EXECUTABLE_PATH") {
        let custom_path = PathBuf::from(&custom);
        if custom_path.exists() {
            return Some(custom_path);
        }
    }

    candidates.into_iter().find(|p| p.exists())
}

pub fn generate_pdf_from_html(html: &str) -> Result<Vec<u8>, PdfError> {
    let browser = find_browser().ok_or_else(|| {
        PdfError::BrowserNotFound(
            "No supported browser found. Install Google Chrome or Microsoft Edge.".into(),
        )
    })?;

    let temp_dir = tempfile::tempdir().map_err(|e| PdfError::PrintFailed(e.to_string()))?;
    let html_path = temp_dir.path().join("document.html");
    let pdf_path = temp_dir.path().join("output.pdf");

    std::fs::write(&html_path, html).map_err(|e| PdfError::PrintFailed(e.to_string()))?;

    let html_url = format!(
        "file:///{}",
        html_path.display().to_string().replace('\\', "/")
    );

    let output = Command::new(&browser)
        .args([
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            &format!("--print-to-pdf={}", pdf_path.display()),
            &html_url,
        ])
        .output()
        .map_err(|e| PdfError::PrintFailed(format!("Failed to launch browser: {e}")))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(PdfError::PrintFailed(format!(
            "Browser print failed: {stderr}"
        )));
    }

    if !pdf_path.exists() {
        return Err(PdfError::PrintFailed(
            "PDF file was not created by the browser.".into(),
        ));
    }

    std::fs::read(&pdf_path).map_err(|e| PdfError::PrintFailed(e.to_string()))
}

#[cfg(test)]
mod tests {
    use super::find_browser;

    #[test]
    fn browser_detection_does_not_panic() {
        let _ = find_browser();
    }
}
