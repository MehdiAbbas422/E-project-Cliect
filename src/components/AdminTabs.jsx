import { Link, useLocation } from 'react-router-dom'

// Purpose: Shared tab navigation shown at the top of every admin page so the
// organizer can jump between the dashboard, applications, feedback and users.
const tabs = [
  { to: '/dashboard', label: '🎪 Expos & agenda' },
  { to: '/admin/exhibitors', label: '📄 Applications' },
  { to: '/admin/feedback', label: '💬 Feedback' },
  { to: '/admin/users', label: '👥 Users' }
]

const AdminTabs = () => {
  const { pathname } = useLocation()
  return (
    <div className="admin-tabs">
      {tabs.map((tab) => (
        <Link key={tab.to} to={tab.to} className={pathname === tab.to ? 'active' : ''}>
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

export default AdminTabs
