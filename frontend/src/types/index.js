export const CartStatus = {
  IDLE: 'IDLE',
  DELIVERING: 'DELIVERING',
  FAULT: 'FAULT',
  CHARGING: 'CHARGING'
}

export const CartStatusLabels = {
  [CartStatus.IDLE]: '空闲',
  [CartStatus.DELIVERING]: '送货中',
  [CartStatus.FAULT]: '故障',
  [CartStatus.CHARGING]: '充电中'
}

export const CartStatusColors = {
  [CartStatus.IDLE]: 'success',
  [CartStatus.DELIVERING]: 'processing',
  [CartStatus.FAULT]: 'error',
  [CartStatus.CHARGING]: 'warning'
}

export const TaskStatus = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
}

export const TaskStatusLabels = {
  [TaskStatus.PENDING]: '待指派',
  [TaskStatus.ASSIGNED]: '已指派',
  [TaskStatus.IN_PROGRESS]: '执行中',
  [TaskStatus.COMPLETED]: '已完成',
  [TaskStatus.CANCELLED]: '已取消'
}

export const TaskStatusColors = {
  [TaskStatus.PENDING]: 'default',
  [TaskStatus.ASSIGNED]: 'warning',
  [TaskStatus.IN_PROGRESS]: 'processing',
  [TaskStatus.COMPLETED]: 'success',
  [TaskStatus.CANCELLED]: 'error'
}

export const TaskType = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
  TRANSFER: 'TRANSFER'
}

export const TaskTypeLabels = {
  [TaskType.DELIVERY]: '送货',
  [TaskType.PICKUP]: '取货',
  [TaskType.TRANSFER]: '调拨'
}

export const API_BASE_URL = '/api'
export const WS_BASE_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/cart`
