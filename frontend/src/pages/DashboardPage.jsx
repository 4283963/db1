import { useState, useEffect, useMemo } from 'react'
import { message, Spin, Select, Row, Col, Statistic } from 'antd'
import { CarOutlined, ExclamationCircleOutlined, ThunderboltOutlined, CoffeeOutlined } from '@ant-design/icons'
import CartCard from '../components/CartCard.jsx'
import { cartApi } from '../services/api.js'
import { useCartWebSocket } from '../hooks/useCartWebSocket.js'
import { CartStatus } from '../types'

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
  const { cartUpdates, isConnected } = useCartWebSocket()

  const loadCarts = async () => {
    try {
      setLoading(true)
      const data = await cartApi.getAll()
      setCarts(data || [])
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
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = cartUpdates
          return updated
        }
        return [...prev, cartUpdates]
      })
    }
  }, [cartUpdates])

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
