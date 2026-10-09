import { useCallback, useEffect, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

// Purpose: Admin user management — search accounts, change roles, block or
// unblock users and delete them (pagination included).
const AdminUsers = () => {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback((p = 1, term = '') => {
    api.get('/admin/users', { params: { page: p, limit: 10, search: term || undefined } })
      .then(({ data }) => {
        setUsers(data.items || [])
        setPages(data.pages || 1)
        setPage(data.page || 1)
      })
      .catch(() => setUsers([]))
  }, [])

  useEffect(() => { load(1, '') }, [load])

  const changeRole = async (id, role) => {
    await api.patch(`/admin/users/${id}`, { role })
    setUsers((current) => current.map((u) => (u._id === id ? { ...u, role } : u)))
    setMessage('Role updated')
  }

  const toggleBlock = async (u) => {
    await api.patch(`/admin/users/${u._id}`, { blocked: !u.blocked })
    setUsers((current) => current.map((x) => (x._id === u._id ? { ...x, blocked: !x.blocked } : x)))
    setMessage(u.blocked ? 'User unblocked' : 'User blocked')
  }

  const remove = async (id) => {
    await api.delete(`/admin/users/${id}`)
    setUsers((current) => current.filter((u) => u._id !== id))
    setMessage('User deleted')
  }

  const searchNow = (value) => {
    setSearch(value)
    load(1, value)
  }

  return (
    <div className="card">
      <div className="row between">
        <h2 style={{ margin: 0 }}>User management</h2>
        <div className="search" style={{ margin: 0, minWidth: 240 }}>
          <span className="em">🔎</span>
          <input placeholder="Search name or email…" value={search} onChange={(e) => searchNow(e.target.value)} />
        </div>
      </div>
      {message && <p className="success">{message}</p>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}{u._id === me?.id && <span className="muted"> (you)</span>}</td>
                <td className="muted">{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={u._id === me?.id}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                  >
                    <option value="attendee">attendee</option>
                    <option value="exhibitor">exhibitor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td>
                  <span className={`badge ${u.blocked ? 'rejected' : u.isVerified ? 'approved' : 'pending'}`}>
                    {u.blocked ? 'blocked' : u.isVerified ? 'verified' : 'unverified'}
                  </span>
                </td>
                <td>
                  <div className="row">
                    <button type="button" className="ghost" disabled={u._id === me?.id} onClick={() => toggleBlock(u)}>
                      {u.blocked ? 'Unblock' : 'Block'}
                    </button>
                    <button type="button" className="danger" disabled={u._id === me?.id} onClick={() => remove(u._id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="5" className="muted" style={{ textAlign: 'center', padding: 20 }}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="pager">
          <button type="button" className="ghost" disabled={page <= 1} onClick={() => load(page - 1, search)}>Prev</button>
          <span className="muted">Page {page} of {pages}</span>
          <button type="button" className="ghost" disabled={page >= pages} onClick={() => load(page + 1, search)}>Next</button>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
