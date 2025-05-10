// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::thread;
use std::time::Duration;

use log::trace;
use tauri::{AppHandle, Emitter};


static mut RUNNING:bool = false;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)

}

#[tauri::command]
fn start_timer(app: AppHandle) {
    unsafe {
        RUNNING = true;
        thread::spawn( move|| {
            while RUNNING {
                // 业务逻辑
                trace!("[同步线程] 每秒执行: {:?}", chrono::Local::now());
                
                // 阻塞当前线程1秒
                thread::sleep(Duration::from_secs(1));
                app.emit("tick", "1").unwrap();
            }
        });
    }
}


#[tauri::command]
fn stop_timer(app: AppHandle) {
    unsafe {
        RUNNING = false;
    }
    trace!("[同步线程] 执行结束: {:?}", chrono::Local::now());
    app.emit("tick", "2").unwrap();
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, start_timer, stop_timer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
