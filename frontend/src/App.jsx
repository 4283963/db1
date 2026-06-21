import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'
import { DashboardOutlined, FormOutlined } from '@ant-design/icons'
import DashboardPage from './pages/DashboardPage.jsx'
import TaskAssignPage from './pages/TaskAssignPage.jsx'

const { Header, Content, Sider } = Layout
const { Title } = Typography

function App() {
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">实时看板</Link>
    },
    {
      key: '/task-assign',
      icon: <FormOutlined />,
      label: <Link to="/task-assign">任务指派</Link>
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={220}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '0 16px'
        }}>
          <Title level={4} style={{ color: 'white', margin: 0, whiteSpace: 'nowrap' }}>
            🚚 物料小车调度
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: 'white',
          padding: '0 24px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Title level={3} style={{ margin: 0 }}>
            {location.pathname === '/dashboard' ? '实时监控看板' : '任务指派管理'}
          </Title>
        </Header>
        <Content>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/task-assign" element={<TaskAssignPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
