import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_BASE_URL } from '../types'

export function useCartWebSocket() {
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const [cartUpdates, setCartUpdates] = useState(null)
  const [taskUpdates, setTaskUpdates] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const ws = new WebSocket(WS_BASE_URL)

      ws.onopen = () => {
        console.log('[WebSocket] 连接已建立')
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.type === 'CART_UPDATE') {
            setCartUpdates(msg.data)
          } else if (msg.type === 'TASK_UPDATE') {
            setTaskUpdates(msg.data)
          }
        } catch (e) {
          console.error('[WebSocket] 消息解析失败:', e)
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
        setIsConnected(false)
      }

      ws.onclose = () => {
        console.log('[WebSocket] 连接已关闭，3秒后重连...')
        setIsConnected(false)
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current)
        }
        reconnectTimerRef.current = setTimeout(connect, 3000)
      }

      wsRef.current = ws
    } catch (e) {
      console.error('[WebSocket] 创建连接失败:', e)
    }
  }, [])

  useEffect(() => {
    connect()

    const pingTimer = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'PING' }))
      }
    }, 30000)

    return () => {
      clearInterval(pingTimer)
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  return { cartUpdates, taskUpdates, isConnected }
}
