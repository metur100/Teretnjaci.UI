import { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await usersApi.update(editingUser.id, {
          fullName: formData.fullName,
          email: formData.email,
          isActive: formData.isActive
        });
        alert('Admin je uspješno ažuriran');
      } else {
        await usersApi.create(formData);
        alert('Admin je uspješno kreiran');
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({ username: '', password: '', fullName: '', email: '' });
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Greška pri čuvanju admina');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Jeste li sigurni da želite obrisati admina "${username}"?`)) {
      try {
        await usersApi.delete(id);
        loadUsers();
      } catch (error) {
        alert('Greška pri brisanju admina');
      }
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await usersApi.update(user.id, {
        fullName: user.fullName,
        email: user.email,
        isActive: !user.isActive
      });
      loadUsers();
    } catch (error) {
      alert('Greška pri ažuriranju statusa');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-header">
        <h1>Upravljanje adminima</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', password: '', fullName: '', email: '' });
            setShowModal(true);
          }}
        >
          <Plus size={18} />
          Novi admin
        </button>
      </div>

      {users.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Korisničko ime</th>
                <th>Puno ime</th>
                <th>Email</th>
                <th>Rola</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      backgroundColor: user.role === 'Owner' ? '#dc262620' : '#3b82f620',
                      color: user.role === 'Owner' ? '#dc2626' : '#3b82f6'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      backgroundColor: user.isActive ? '#22c55e20' : '#ef444420',
                      color: user.isActive ? '#22c55e' : '#ef4444'
                    }}>
                      {user.isActive ? 'Aktivan' : 'Neaktivan'}
                    </span>
                  </td>
                  <td>
                    {user.role !== 'Owner' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEdit(user)}
                          style={{ padding: '0.5rem' }}
                          title="Uredi"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => toggleUserStatus(user)}
                          style={{ padding: '0.5rem' }}
                          title={user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(user.id, user.username)}
                          style={{ padding: '0.5rem' }}
                          title="Obriši"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Nema admina za prikaz</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid var(--border)'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>
              {editingUser ? 'Uredi admina' : 'Novi admin'}
            </h2>

            <form onSubmit={handleSubmit}>
              {!editingUser && (
                <>
                  <div className="form-group">
                    <label>Korisničko ime *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Lozinka *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Puno ime *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              {editingUser && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    Aktivan
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  Sačuvaj
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({ username: '', password: '', fullName: '', email: '' });
                  }}
                >
                  Otkaži
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
