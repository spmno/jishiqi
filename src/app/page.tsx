"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
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

  // 第一个计时器effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning1) {
      interval = setInterval(() => {
        setTimer1(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning1])

  // 第二个计时器effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning2) {
      interval = setInterval(() => {
        setTimer2(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning2])


  // 长按开始处理
  const handleLongPressStart = (timerNum: number) => {
    invoke('start_timer');
  }

  // 长按取消处理
  const handleLongPressCancel = (timerNum: number) => {
    const timer = timerNum === 1 ? longPressTimer1 : longPressTimer2
    if (timer.current) {
    clearTimeout(timer.current as NodeJS.Timeout)
  }

  useEffect(() => {
    // 监听事件
    const unlisten = listen<String>('tick', (event) => {
      console.log('收到tick事件.');
    });

    // 组件卸载时取消监听
    return () => {
      unlisten.then(fn => fn());
    };
  }, []);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      {/* 第一个计时器 - 活动时间 */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold">活动时间</h2>
        <h1 className="text-4xl font-bold">{formatTime(timer1)}</h1>
        <Button 
          onClick={() => setIsRunning1(!isRunning1)}
          onMouseDown={() => handleLongPressStart(1)}
          onMouseUp={() => handleLongPressCancel(1)}
          onTouchStart={() => handleLongPressStart(1)}
          onTouchEnd={() => handleLongPressCancel(1)}
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
          onMouseUp={() => handleLongPressCancel(2)}
          onTouchStart={() => handleLongPressStart(2)}
          onTouchEnd={() => handleLongPressCancel(2)}
          className="w-32"
        >
          {isRunning2 ? '暂停' : '开始'}
        </Button>
      </div>
    </div>
  )
}
