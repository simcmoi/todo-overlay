/// Récupère le changelog depuis GitHub pour une version spécifique
/// ou depuis le fichier CHANGELOG.md local si GitHub n'est pas accessible
#[tauri::command]
pub async fn get_changelog(version: String) -> Result<String, String> {
    // D'abord essayer de récupérer depuis l'API GitHub
    match fetch_changelog_from_github(&version).await {
        Ok(changelog) => Ok(changelog),
        Err(_) => {
            // Fallback : lire depuis le fichier local CHANGELOG.md
            extract_local_changelog(&version)
        }
    }
}

/// Récupère le changelog depuis une release GitHub
async fn fetch_changelog_from_github(version: &str) -> Result<String, String> {
    let url = format!(
        "https://api.github.com/repos/simcmoi/blinkdo/releases/tags/v{}",
        version
    );

    let client = reqwest::Client::new();
    let response = client
        .get(&url)
        .header("User-Agent", "blinkdo")
        .header("Accept", "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch changelog: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub API returned status: {}", response.status()));
    }

    let release: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse JSON: {}", e))?;

    release
        .get("body")
        .and_then(|b| b.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| "No body found in release".to_string())
}

/// Extrait le changelog depuis le fichier CHANGELOG.md local
fn extract_local_changelog(version: &str) -> Result<String, String> {
    // Lire CHANGELOG.md depuis les ressources de l'app
    let changelog_content = include_str!("../../CHANGELOG.md");

    let mut found = false;
    let mut result = Vec::new();

    for line in changelog_content.lines() {
        // Détecte le début de la section de version
        if line.starts_with("## [") {
            if found {
                // On a atteint la version suivante, on arrête
                break;
            }
            if line.contains(&format!("[{}]", version)) {
                found = true;
                continue;
            }
        }

        // Si on est dans la bonne section, collecter les lignes
        if found {
            result.push(line);
        }
    }

    if result.is_empty() {
        return Err(format!("No changelog found for version {}", version));
    }

    Ok(result.join("\n").trim().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_local_changelog() {
        // Ce test ne fonctionnera qu'après avoir construit l'app
        // car include_str! lit le fichier à la compilation
        let result = extract_local_changelog("0.2.2");
        assert!(result.is_ok());
    }
}
