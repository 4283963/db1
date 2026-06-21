import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Divider,
  Row,
  Col,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  EnvironmentOutlined,
  UserOutlined
} from '@ant-design/icons'
import { taskApi, locationApi, cartApi } from '../services/api.js'
import { useCartWebSocket } from '../hooks/useCartWebSocket.js'
import {
  TaskStatus,
  TaskStatusLabels,
  TaskStatusColors,
  TaskType,
  TaskTypeLabels,
  CartStatus
} from '../types'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function TaskAssignPage() {
  const [form] = Form.useForm()
  const [tasks, setTasks] = useState([])
  const [locations, setLocations] = useState([])
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [assignForm] = Form.useForm()
  const { taskUpdates, cartUpdates } = useCartWebSocket()

  const loadAll = async () => {
    setLoading(true)
    try {
      const [tasksData, locationsData, cartsData] = await Promise.all([
        taskApi.getAll(),
        locationApi.getAll(),
        cartApi.getAll()
      ])
      setTasks(tasksData || [])
      setLocations(locationsData || [])
      setCarts(cartsData || [])
    } catch (err) {
      message.error('加载数据失败: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (taskUpdates) {
      setTasks(prev => {
        const idx = prev.findIndex(t => t.id === taskUpdates.id)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = taskUpdates
          return updated
        }
        return [taskUpdates, ...prev]
      })
    }
  }, [taskUpdates])

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

  const handleCreateTask = async (values) => {
    setSubmitLoading(true)
    try {
      await taskApi.create(values)
      message.success('任务创建成功')
      form.resetFields()
      const data = await taskApi.getAll()
      setTasks(data || [])
    } catch (err) {
      message.error('创建任务失败: ' + err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const openAssignModal = (task) => {
    setCurrentTask(task)
    assignForm.resetFields()
    setAssignModalOpen(true)
  }

  const handleAssign = async (values) => {
    try {
      await taskApi.assign({
        taskId: currentTask.id,
        cartId: values.cartId
      })
      message.success('任务指派成功')
      setAssignModalOpen(false)
      const data = await taskApi.getAll()
      setTasks(data || [])
    } catch (err) {
      message.error('指派失败: ' + err.message)
    }
  }

  const handleStart = async (task) => {
    try {
      await taskApi.start(task.id)
      message.success('任务已开始执行')
      const data = await taskApi.getAll()
      setTasks(data || [])
    } catch (err) {
      message.error('操作失败: ' + err.message)
    }
  }

  const handleComplete = async (task) => {
    try {
      await taskApi.complete(task.id)
      message.success('任务已完成')
      const data = await taskApi.getAll()
      setTasks(data || [])
    } catch (err) {
      message.error('操作失败: ' + err.message)
    }
  }

  const handleCancel = async (task) => {
    try {
      await taskApi.cancel(task.id)
      message.success('任务已取消')
      const data = await taskApi.getAll()
      setTasks(data || [])
    } catch (err) {
      message.error('操作失败: ' + err.message)
    }
  }

  const availableCarts = carts.filter(c => c.status === CartStatus.IDLE)

  const priorityColors = {
    1: 'default',
    5: 'blue',
    10: 'red'
  }

  const columns = [
    {
      title: '任务编号',
      dataIndex: 'taskCode',
      key: 'taskCode',
      width: 180,
      render: (v) => <span style={{ fontFamily: 'monospace' }}>{v}</span>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (v) => <Tag color="blue">{TaskTypeLabels[v]}</Tag>
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (v) => (
        <Tag color={v >= 8 ? 'red' : v >= 5 ? 'orange' : 'default'}>
          P{v}
        </Tag>
      )
    },
    {
      title: '货物信息',
      key: 'cargo',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.cargoName}</div>
          <div style={{ color: '#999', fontSize: 12 }}>重量: {r.cargoWeight} kg</div>
        </div>
      )
    },
    {
      title: '起始位置',
      key: 'source',
      render: (_, r) => (
        <span className="location-badge">
          <EnvironmentOutlined /> {r.sourceLocation?.name}
        </span>
      )
    },
    {
      title: '目标位置',
      key: 'target',
      render: (_, r) => (
        <span className="location-badge" style={{ background: '#f6ffed', color: '#52c41a' }}>
          <EnvironmentOutlined /> {r.targetLocation?.name}
        </span>
      )
    },
    {
      title: '指派小车',
      key: 'cart',
      width: 140,
      render: (_, r) => r.cart ? `${r.cart.name} (${r.cart.cartCode})` : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (v) => (
        <Tag color={TaskStatusColors[v]}>{TaskStatusLabels[v]}</Tag>
      )
    },
    {
      title: '创建人',
      key: 'creator',
      width: 100,
      render: (_, r) => (
        <span>
          <UserOutlined style={{ marginRight: 4 }} /> {r.creator}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v) => dayjs(v).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, r) => (
        <Space size="small">
          {r.status === TaskStatus.PENDING && (
            <Button
              size="small"
              type="primary"
              icon={<SendOutlined />}
              onClick={() => openAssignModal(r)}
            >
              指派
            </Button>
          )}
          {r.status === TaskStatus.ASSIGNED && (
            <Button
              size="small"
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStart(r)}
            >
              开始
            </Button>
          )}
          {r.status === TaskStatus.IN_PROGRESS && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleComplete(r)}
            >
              完成
            </Button>
          )}
          {r.status !== TaskStatus.COMPLETED && r.status !== TaskStatus.CANCELLED && (
            <Popconfirm
              title="确认取消此任务？"
              onConfirm={() => handleCancel(r)}
              okText="确认取消"
              cancelText="再想想"
            >
              <Button size="small" danger icon={<CloseCircleOutlined />}>
                取消
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  const locationOptions = locations.map(l => ({
    label: `${l.code} - ${l.name}`,
    value: l.id
  }))

  return (
    <div className="page-container">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title={<span><PlusOutlined /> 发布新任务</span>} bordered>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateTask}
              initialValues={{ type: 'DELIVERY', priority: 5, cargoWeight: 0 }}
            >
              <Form.Item
                label="任务类型"
                name="type"
                rules={[{ required: true, message: '请选择任务类型' }]}
              >
                <Select
                  options={[
                    { label: '送货', value: TaskType.DELIVERY },
                    { label: '取货', value: TaskType.PICKUP },
                    { label: '调拨', value: TaskType.TRANSFER }
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="优先级"
                name="priority"
                rules={[{ required: true, message: '请输入优先级' }]}
              >
                <Select
                  options={[
                    { label: '低 (P1)', value: 1 },
                    { label: '普通 (P3)', value: 3 },
                    { label: '中 (P5)', value: 5 },
                    { label: '高 (P7)', value: 7 },
                    { label: '紧急 (P10)', value: 10 }
                  ]}
                />
              </Form.Item>

              <Form.Item
                label="起始位置"
                name="sourceLocationId"
                rules={[{ required: true, message: '请选择起始位置' }]}
              >
                <Select showSearch placeholder="选择起始位置" options={locationOptions} />
              </Form.Item>

              <Form.Item
                label="目标位置"
                name="targetLocationId"
                rules={[{ required: true, message: '请选择目标位置' }]}
              >
                <Select showSearch placeholder="选择目标位置" options={locationOptions} />
              </Form.Item>

              <Form.Item
                label="货物名称"
                name="cargoName"
                rules={[{ required: true, message: '请输入货物名称' }]}
              >
                <Input placeholder="例如: 钢材原材料" />
              </Form.Item>

              <Form.Item
                label="货物重量 (kg)"
                name="cargoWeight"
                rules={[{ required: true, message: '请输入货物重量' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={9999}
                  step={10}
                  placeholder="货物重量"
                />
              </Form.Item>

              <Form.Item
                label="创建人"
                name="creator"
                rules={[{ required: true, message: '请输入创建人' }]}
              >
                <Input placeholder="调度员姓名" />
              </Form.Item>

              <Form.Item label="备注" name="remark">
                <TextArea rows={3} placeholder="可选" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitLoading}
                  block
                  size="large"
                  icon={<PlusOutlined />}
                >
                  发布任务
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="任务列表"
            bordered
            extra={
              <Space>
                <Tag color="default">待指派: {tasks.filter(t => t.status === TaskStatus.PENDING).length}</Tag>
                <Tag color="warning">已指派: {tasks.filter(t => t.status === TaskStatus.ASSIGNED).length}</Tag>
                <Tag color="processing">执行中: {tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length}</Tag>
                <Tag color="success">已完成: {tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</Tag>
              </Space>
            }
          >
            <Table
              loading={loading}
              columns={columns}
              dataSource={tasks}
              rowKey="id"
              scroll={{ x: 1400 }}
              size="middle"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条任务`
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={`指派任务 - ${currentTask?.taskCode || ''}`}
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        {currentTask && (
          <div style={{ marginBottom: 20 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ padding: 12, background: '#fafafa', borderRadius: 6 }}>
                <div><strong>{currentTask.cargoName}</strong> ({currentTask.cargoWeight} kg)</div>
                <div style={{ color: '#666', marginTop: 4 }}>
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  {currentTask.sourceLocation?.name} → {currentTask.targetLocation?.name}
                </div>
              </div>
            </Space>
            <Divider />
            <Form
              form={assignForm}
              layout="vertical"
              onFinish={handleAssign}
            >
              <Form.Item
                label="选择空闲小车"
                name="cartId"
                rules={[{ required: true, message: '请选择小车' }]}
              >
                <Select
                  placeholder="请选择要指派的小车"
                  options={availableCarts.map(c => ({
                    label: `${c.name} (${c.cartCode}) - ${c.currentLocation?.name || '未知位置'} - 电量${c.batteryLevel}% - 载重上限${c.maxLoad}kg`,
                    value: c.id
                  }))}
                  disabled={availableCarts.length === 0}
                />
              </Form.Item>
              {availableCarts.length === 0 && (
                <div style={{ color: '#ff4d4f', fontSize: 13, marginBottom: 16 }}>
                  ⚠️ 当前没有空闲的小车，请等待或先完成其他任务
                </div>
              )}
              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Space>
                  <Button onClick={() => setAssignModalOpen(false)}>取消</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={availableCarts.length === 0}
                    icon={<SendOutlined />}
                  >
                    确认指派
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  )
}
