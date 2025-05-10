// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::thread;
use std::time::Duration;

use log::trace;
use tauri::{AppHandle, Emitter};

#[cfg(mobile)]
use tauri_plugin_app_events::AppEventsExt;
use tauri::ipc::Channel;


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
        .setup(|app| {
                #[cfg(mobile)]
                {
                                   //app.handle().plugin(tauri_plugin_app_events::init())?;
                    let app_handle = app.handle();
                    app_handle.plugin(tauri_plugin_app_events::init())?;
                    let app_cloned = app_handle.clone();
                    app_handle
                        .app_events()
                        .set_resume_handler(Channel::new(move |_| {
                            // The app has returned to the foreground.
                            app_cloned.emit("js-log", "set_resume_handler")?;
                            trace!("我在前台: {:?}", chrono::Local::now());
                            Ok(())
                        }))?;
                    let app_cloned = app_handle.clone();
                    app_handle
                        .app_events()
                        .set_pause_handler(Channel::new(move |_| {
                            // The app has switched to the background.
                            app_cloned.emit("js-log", "set_pause_handler")?;
                            trace!("我去后台: {:?}", chrono::Local::now());
                            Ok(())
                        }))?; 
                }
                Ok(())
            })
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, start_timer, stop_timer])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
