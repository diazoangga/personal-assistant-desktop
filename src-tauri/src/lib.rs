// Window/tray shell only — no cognitive logic lives here (docs/ARCHITECTURE.md §1).
// Backend supervision (spawning `python -m src.adapters.api` as a child
// process) is the "Supervised" lifecycle tier and is out of MVP scope; see
// docs/ARCHITECTURE.md §5.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
