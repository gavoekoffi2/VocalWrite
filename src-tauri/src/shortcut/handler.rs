use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};
use winit::keyboard::{KeyCode, ModifiersState};

pub fn setup_shortcut(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let shortcut = app.global_shortcut();
    
    // Ctrl + Space
    let trigger = tauri_plugin_global_shortcut::Shortcut::new(
        Some(ModifiersState::CONTROL),
        KeyCode::Space,
    );

    shortcut.register(trigger)?;
    
    app.listen_global("shortcut", move |event| {
        // Logique de Start/Stop à déclencher ici
        println!("Shortcut pressed!");
    });

    Ok(())
}
