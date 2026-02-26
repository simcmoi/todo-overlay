use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub available: bool,
    pub current_version: String,
    pub latest_version: Option<String>,
    pub release_date: Option<String>,
    pub release_notes: Option<String>,
}

#[tauri::command]
pub async fn check_for_update(app: AppHandle) -> Result<UpdateInfo, String> {
    log::info!("Vérification des mises à jour...");

    let current_version = app.package_info().version.to_string();

    match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => {
                log::info!(
                    "Mise à jour disponible : {} -> {}",
                    current_version,
                    update.version
                );

                Ok(UpdateInfo {
                    available: true,
                    current_version,
                    latest_version: Some(update.version.clone()),
                    release_date: update.date.as_ref().map(|date| date.to_string()),
                    release_notes: update.body.clone(),
                })
            }
            Ok(None) => {
                log::info!(
                    "Aucune mise à jour disponible (version actuelle : {})",
                    current_version
                );
                Ok(UpdateInfo {
                    available: false,
                    current_version,
                    latest_version: None,
                    release_date: None,
                    release_notes: None,
                })
            }
            Err(error) => {
                log::error!("Erreur lors de la vérification des mises à jour : {error}");
                Err(format!(
                    "Échec de la vérification des mises à jour : {error}"
                ))
            }
        },
        Err(error) => {
            log::error!("Échec de l'initialisation de l'updater : {error}");
            Err(format!("Échec de l'initialisation de l'updater : {error}"))
        }
    }
}

#[tauri::command]
pub async fn install_update(app: AppHandle) -> Result<(), String> {
    log::info!("Début de l'installation de la mise à jour...");

    match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => {
                log::info!("Téléchargement de la version {}...", update.version);

                // Émettre des événements de progression
                if let Err(e) = app.emit("update-progress", "downloading") {
                    log::warn!("Échec de l'émission de l'événement update-progress: {}", e);
                }

                match update
                    .download_and_install(
                        |chunk_length, content_length| {
                            if let Some(total) = content_length {
                                let progress = (chunk_length as f64 / total as f64) * 100.0;
                                log::debug!("Progression du téléchargement : {:.1}% ({}/{})", progress, chunk_length, total);

                                // Émettre la progression avec les détails
                                if let Err(e) = app.emit("update-download-progress", serde_json::json!({
                                    "progress": progress,
                                    "chunkLength": chunk_length,
                                    "contentLength": total
                                })) {
                                    log::warn!("Échec de l'émission de l'événement update-download-progress: {}", e);
                                }
                            }
                        },
                        || {
                            log::info!("Téléchargement terminé, installation en cours...");
                            if let Err(e) = app.emit("update-progress", "installing") {
                                log::warn!("Échec de l'émission de l'événement update-progress: {}", e);
                            }
                        },
                    )
                    .await
                {
                    Ok(()) => {
                        log::info!("Mise à jour installée avec succès, redémarrage...");
                        if let Err(e) = app.emit("update-progress", "restarting") {
                            log::warn!("Échec de l'émission de l'événement update-progress: {}", e);
                        }
                        app.restart();
                        #[allow(unreachable_code)]
                        Ok(())
                    }
                    Err(error) => {
                        log::error!("Échec de l'installation de la mise à jour : {error}");
                        let error_msg = format!("Échec de l'installation : {error}");
                        // Émettre un événement d'erreur
                        if let Err(e) = app.emit("update-error", &error_msg) {
                            log::warn!("Échec de l'émission de l'événement update-error: {}", e);
                        }
                        Err(error_msg)
                    }
                }
            }
            Ok(None) => {
                log::warn!("Aucune mise à jour disponible pour l'installation");
                Err("Aucune mise à jour disponible".to_string())
            }
            Err(error) => {
                log::error!("Erreur lors de la vérification des mises à jour : {error}");
                let error_msg = format!("Échec de la vérification : {error}");
                if let Err(e) = app.emit("update-error", &error_msg) {
                    log::warn!("Échec de l'émission de l'événement update-error: {}", e);
                }
                Err(error_msg)
            }
        },
        Err(error) => {
            log::error!("Échec de l'initialisation de l'updater : {error}");
            let error_msg = format!("Échec de l'initialisation de l'updater : {error}");
            if let Err(e) = app.emit("update-error", &error_msg) {
                log::warn!("Échec de l'émission de l'événement update-error: {}", e);
            }
            Err(error_msg)
        }
    }
}
