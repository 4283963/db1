import { useState, useEffect, useMemo, useRef } from 'react'
import { message, Spin, Select, Row, Col, Statistic, Button } from 'antd'
import { CarOutlined, ExclamationCircleOutlined, ThunderboltOutlined, CoffeeOutlined, WarningOutlined } from '@ant-design/icons'
import CartCard from '../components/CartCard.jsx'
import { cartApi } from '../services/api.js'
import { useCartWebSocket } from '../hooks/useCartWebSocket.js'
import { CartStatus } from '../types'
import dayjs from 'dayjs'

const filterOptions = [
  { label: '全部小车', value: 'ALL' },
  { label: '空闲小车', value: CartStatus.IDLE },
  { label: '送货中小车', value: CartStatus.DELIVERING },
  { label: '故障小车', value: CartStatus.FAULT },
  { label: '充电中小车', value: CartStatus.CHARGING }
]

export default function DashboardPage() {
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [unacknowledgedFaults, setUnacknowledgedFaults] = useState([])
  const prevStatusRef = useRef({})
  const { cartUpdates, isConnected } = useCartWebSocket()

  const detectNewFaults = (updatedCarts) => {
    const prevStatus = prevStatusRef.current
    updatedCarts.forEach(cart => {
      const oldStatus = prevStatus[cart.id]
      const newStatus = cart.status
      if (newStatus === CartStatus.FAULT && oldStatus && oldStatus !== CartStatus.FAULT) {
        const faultInfo = {
          cartId: cart.id,
          cartCode: cart.cartCode,
          cartName: cart.name,
          locationName: cart.currentLocation?.name || '未知位置',
          locationCode: cart.currentLocation?.code || '',
          remark: cart.remark || '',
          faultTime: cart.lastUpdate || new Date().toISOString(),
          acknowledged: false,
          id: `${cart.id}-${Date.now()}`
        }
        setUnacknowledgedFaults(prev => {
          const exists = prev.find(f => f.cartId === cart.id && !f.acknowledged)
          if (exists) return prev
          message.warning(`⚠️ ${cart.name} 在 ${faultInfo.locationName} 发生故障！`, 5)
          return [...prev, faultInfo]
        })
      }
      if (newStatus !== CartStatus.FAULT) {
        setUnacknowledgedFaults(prev =>
          prev.filter(f => f.cartId !== cart.id || f.acknowledged)
        )
      }
      prevStatus[cart.id] = newStatus
    })
  }

  const loadCarts = async () => {
    try {
      setLoading(true)
      const data = await cartApi.getAll()
      const cartsData = data || []
      detectNewFaults(cartsData)
      setCarts(cartsData)
    } catch (err) {
      message.error('加载小车数据失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCarts()
  }, [])

  useEffect(() => {
    if (cartUpdates) {
      setCarts(prev => {
        const idx = prev.findIndex(c => c.id === cartUpdates.id)
        let updated
        if (idx >= 0) {
          updated = [...prev]
          updated[idx] = cartUpdates
        } else {
          updated = [...prev, cartUpdates]
        }
        detectNewFaults(updated)
        return updated
      })
    }
  }, [cartUpdates])

  const handleAcknowledgeFault = (faultId) => {
    setUnacknowledgedFaults(prev =>
      prev.filter(f => f.id !== faultId)
    )
    message.success('已确认告警')
  }

  const handleAcknowledgeAll = () => {
    setUnacknowledgedFaults([])
    message.success('已确认所有告警')
  }

  const activeUnacknowledged = unacknowledgedFaults.filter(f => {
    const cart = carts.find(c => c.id === f.cartId)
    return cart && cart.status === CartStatus.FAULT
  })

  const stats = useMemo(() => {
    return {
      total: carts.length,
      idle: carts.filter(c => c.status === CartStatus.IDLE).length,
      delivering: carts.filter(c => c.status === CartStatus.DELIVERING).length,
      fault: carts.filter(c => c.status === CartStatus.FAULT).length,
      charging: carts.filter(c => c.status === CartStatus.CHARGING).length
    }
  }, [carts])

  const filteredCarts = useMemo(() => {
    if (filterStatus === 'ALL') return carts
    return carts.filter(c => c.status === filterStatus)
  }, [carts, filterStatus])

  return (
    <div className="page-container">
      {activeUnacknowledged.length > 0 && (
        <div className="fault-alert-bar">
          <div className="alert-icon">🚨</div>
          <div className="alert-content">
            <div className="alert-title">
              <WarningOutlined />
              严重故障告警
              <span className="alert-count-badge">{activeUnacknowledged.length}</span>
            </div>
            {activeUnacknowledged.length === 1 ? (
              <div className="alert-detail">
                小车 <strong>{activeUnacknowledged[0].cartName}</strong> ({activeUnacknowledged[0].cartCode})
                在 <strong>{activeUnacknowledged[0].locationName}</strong> 发生故障
                {activeUnacknowledged[0].remark && ` - ${activeUnacknowledged[0].remark}`}
                ，发生于 {dayjs(activeUnacknowledged[0].faultTime).format('HH:mm:ss')}
              </div>
            ) : (
              <div className="alert-detail">
                共 {activeUnacknowledged.length} 辆小车发生故障：
                {activeUnacknowledged.map((f, i) => (
                  <span key={f.id}>
                    {i > 0 ? '、' : ''}
                    <strong>{f.cartName}</strong> @ {f.locationName}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {activeUnacknowledged.length > 1 && (
              <button
                className="alert-confirm-btn"
                onClick={handleAcknowledgeAll}
              >
                全部确认
              </button>
            )}
            {activeUnacknowledged.length === 1 && (
              <button
                className="alert-confirm-btn"
                onClick={() => handleAcknowledgeFault(activeUnacknowledged[0].id)}
              >
                确认已知晓
              </button>
            )}
            {activeUnacknowledged.length > 1 && activeUnacknowledged.map(fault => (
              <button
                key={fault.id}
                className="alert-confirm-btn"
                onClick={() => handleAcknowledgeFault(fault.id)}
                style={{ display: 'none' }}
              >
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div className="ws-status">
          <span className={`ws-dot ${isConnected ? '' : 'disconnected'}`}></span>
          <span style={{ color: isConnected ? '#52c41a' : '#ff4d4f' }}>
            {isConnected ? '实时连接已建立' : '实时连接已断开'}
          </span>
        </div>
        <Select
          style={{ width: 180 }}
          value={filterStatus}
          onChange={setFilterStatus}
          options={filterOptions}
        />
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>总车辆数</h3>
          <div className="stat-num" style={{ color: '#1677ff' }}>
            <CarOutlined style={{ marginRight: 8 }} />{stats.total}
          </div>
        </div>
        <div className="stat-card">
          <h3>空闲车辆</h3>
          <div className="stat-num" style={{ color: '#52c41a' }}>
            <CoffeeOutlined style={{ marginRight: 8 }} />{stats.idle}
          </div>
        </div>
        <div className="stat-card">
          <h3>送货中</h3>
          <div className="stat-num" style={{ color: '#1677ff' }}>
            <CarOutlined style={{ marginRight: 8 }} />{stats.delivering}
          </div>
        </div>
        <div className="stat-card">
          <h3>故障车辆</h3>
          <div className="stat-num" style={{ color: stats.fault > 0 ? '#ff4d4f' : '#8c8c8c' }}>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />{stats.fault}
          </div>
        </div>
        <div className="stat-card">
          <h3>充电中</h3>
          <div className="stat-num" style={{ color: '#faad14' }}>
            <ThunderboltOutlined style={{ marginRight: 8 }} />{stats.charging}
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        <div className="cart-grid">
          {filteredCarts.map(cart => (
            <CartCard key={cart.id} cart={cart} />
          ))}
          {filteredCarts.length === 0 && !loading && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: 60,
              background: 'white',
              borderRadius: 8,
              color: '#999'
            }}>
              暂无符合条件的小车数据
            </div>
          )}
        </div>
      </Spin>
    </div>
  )
}
