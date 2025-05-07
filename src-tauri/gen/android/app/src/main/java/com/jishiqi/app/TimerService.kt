
class TimerService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private var counter = 0
    private val runnable = object : Runnable {
        override fun run() {
            counter++
            // 通过 Tauri 发送计时器数据到前端
            TauriBinding().executeJs("window.dispatchEvent(new CustomEvent('timerUpdate', { detail: $counter }))")
            handler.postDelayed(this, 1000) // 每秒触发
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 绑定前台服务并显示通知（Android 8.0+ 强制要求）
        val notification = NotificationCompat.Builder(this, "timer_channel")
            .setContentTitle("定时器运行中")
            .setSmallIcon(R.drawable.ic_notification)
            .build()
        startForeground(1, notification)

        handler.post(runnable) // 启动定时器
        return START_STICKY
    }
}