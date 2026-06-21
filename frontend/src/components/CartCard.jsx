import { Card, Tag, Progress, Tooltip } from 'antd'
import {
  EnvironmentOutlined,
  BatteryFilled,
  ThunderboltOutlined,
  CarOutlined,
  WarningOutlined,
  CoffeeOutlined
} from '@ant-design/icons'
import { CartStatus, CartStatusLabels, CartStatusColors } from '../types'
import dayjs from 'dayjs'

const statusIcons = {
  [CartStatus.IDLE]: <CoffeeOutlined />,
  [CartStatus.DELIVERING]: <CarOutlined />,
  [CartStatus.FAULT]: <WarningOutlined />,
  [CartStatus.CHARGING]: <ThunderboltOutlined />
}

function getBatteryColor(level) {
  if (level <= 20) return '#ff4d4f'
  if (level <= 50) return '#faad14'
  return '#52c41a'
}

export default function CartCard({ cart }) {
  const loadPercent = cart.maxLoad > 0 ? Math.min(100, (cart.currentLoad / cart.maxLoad) * 100) : 0
  const timeAgo = dayjs(cart.lastUpdate).fromNow()

  return (
    <Card
      className={`cart-card ${cart.status === CartStatus.DELIVERING ? 'status-delivering' : ''}`}
      bordered
      styles={{ body: { padding: 20 } }}
    >
      <div className="cart-header">
        <div className="cart-title">
          {statusIcons[cart.status]}
          <span>{cart.name}</span>
        </div>
        <Tag
          icon={statusIcons[cart.status]}
          color={CartStatusColors[cart.status]}
          style={{ margin: 0 }}
        >
          {CartStatusLabels[cart.status]}
        </Tag>
      </div>

      <div style={{ color: '#999', fontSize: 12, marginBottom: 16 }}>
        编号: {cart.cartCode} · 更新于 {timeAgo}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="stat-item">
          <span className="stat-label">
            <EnvironmentOutlined style={{ marginRight: 4 }} /> 当前位置
          </span>
          <span className="location-badge">
            {cart.currentLocation ? cart.currentLocation.name : '未知'}
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="stat-item" style={{ marginBottom: 8 }}>
          <span className="stat-label">
            <BatteryFilled style={{ marginRight: 4, color: getBatteryColor(cart.batteryLevel) }} /> 电量
          </span>
          <span className="stat-value" style={{ color: getBatteryColor(cart.batteryLevel), fontWeight: 600 }}>
            {cart.batteryLevel}%
          </span>
        </div>
        <Progress
          percent={cart.batteryLevel}
          size="small"
          showInfo={false}
          strokeColor={getBatteryColor(cart.batteryLevel)}
        />
      </div>

      <div style={{ marginBottom: cart.remark ? 16 : 0 }}>
        <div className="stat-item" style={{ marginBottom: 8 }}>
          <span className="stat-label">载重情况</span>
          <span className="stat-value">
            {cart.currentLoad} / {cart.maxLoad} kg
          </span>
        </div>
        <Progress
          percent={Math.round(loadPercent)}
          size="small"
          showInfo={false}
          strokeColor={loadPercent > 90 ? '#ff4d4f' : loadPercent > 70 ? '#faad14' : '#1677ff'}
        />
      </div>

      {cart.remark && (
        <Tooltip title={cart.remark}>
          <div
            style={{
              padding: '8px 12px',
              background: cart.status === CartStatus.FAULT ? '#fff2f0' : '#fafafa',
              borderRadius: 6,
              fontSize: 12,
              color: cart.status === CartStatus.FAULT ? '#cf1322' : '#666',
              borderLeft: `3px solid ${cart.status === CartStatus.FAULT ? '#ff4d4f' : '#d9d9d9'}`
            }}
          >
            💬 {cart.remark}
          </div>
        </Tooltip>
      )}
    </Card>
  )
}
