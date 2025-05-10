"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { listen } from '@tauri-apps/api/event';
import { invoke } from "@tauri-apps/api/core";

export default function TimerPage() {
  // 第一个计时器状态
  const [timer1, setTimer1] = useState(0)
  const [isRunning1, setIsRunning1] = useState(false)
  
  // 第二个计时器状态
  const [timer2, setTimer2] = useState(0)
  const [isRunning2, setIsRunning2] = useState(false)

  // 格式化时间为MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 长按开始处理
  const handleLongPressStart = (timerNum: number) => {
    if (timerNum == 1) {
      if (isRunning1) {
        invoke('stop_timer');
      } else {
        invoke('start_timer');
      }
    } else {
      if (isRunning2) {
        invoke('stop_timer');
      } else {
        invoke('start_timer');
      }
    }
    
  }


  useEffect(() => {
    // 监听事件
    const unlisten = listen<String>('tick', (event) => {
      console.log('收到tick事件.', event);
      if (isRunning1) {
        setTimer1(prev => prev + 1);
      }

      if (isRunning2) {
        setTimer2(prev => prev + 1);
      }
    });

    // 组件卸载时取消监听
    return () => {
      unlisten.then(fn => fn());
    };
  }, [isRunning1, isRunning2]);
  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {/* 第一个计时器 - 活动时间 */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold">活动时间</h2>
        <h1 className="text-4xl font-bold">{formatTime(timer1)}</h1>
        <Button 
          onClick={() => setIsRunning1(!isRunning1)}
          onMouseDown={() => handleLongPressStart(1)}
          className="w-32"
        >
          {isRunning1 ? '暂停' : '开始'}
        </Button>
      </div>

      {/* 第二个计时器 - 学习时间 */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold">学习时间</h2>
        <h1 className="text-4xl font-bold">{formatTime(timer2)}</h1>
        <Button 
          onClick={() => setIsRunning2(!isRunning2)}
          onMouseDown={() => handleLongPressStart(2)}
          className="w-32"
        >
          {isRunning2 ? '暂停' : '开始'}
        </Button>
      </div>
    </div>
  )
}
