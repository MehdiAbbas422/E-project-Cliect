import '../../css/admin.css'
import AdminTabs from '../../components/AdminTabs'
import AdminUsersTable from '../../components/AdminUsers'
import PageHero from '../../components/PageHero'
import { pageImages } from '../../images'

// Purpose: Admin page for account management — wraps the user table component
// so it lives on its own dedicated route instead of the dashboard.
const AdminUsers = () => (
  <div className="container">
    <PageHero
      eyebrow="Admin area"
      title="User accounts"
      subtitle="Search every account, change roles, block/unblock or delete users."
      image={pageImages.adminUsers}
    />
    <AdminTabs />
    <AdminUsersTable />
  </div>
)

export default AdminUsers
