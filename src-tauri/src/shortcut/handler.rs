use tauri::AppHandle;
use log::debug;

// Remplacement fonctionnel pour Tauri v2
pub fn handle_shortcut_event(app: &AppHandle, binding_id: &str, shortcut: &str, is_pressed: bool) {
    if is_pressed {
        debug!("Shortcut pressed: {} ({})", shortcut, binding_id);
        // On envoie un évènement générique au frontend
        let _ = tauri::Emitter::emit(app, "shortcut-pressed", binding_id);
    }
}
