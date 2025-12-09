import { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import { Plus, Edit, Trash2, UserCheck, UserX, Mail, User, Shield, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Custom Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Otkaži
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Potvrdi
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    isActive: true
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
      setFormData({ username: '', password: '', fullName: '', email: '', isActive: true });
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Greška pri čuvanju admina');
    }
  };

  // Check if current user can edit a specific user
  const canEditUser = (targetUser) => {
    if (!currentUser) return false;
    
    // Owner can edit anyone (including other owners)
    if (currentUser.role === 'Owner') {
      return true;
    }
    
    // Admin can only edit themselves and other admins (not owners)
    if (currentUser.role === 'Admin') {
      // Admin cannot edit owners
      if (targetUser.role === 'Owner') {
        return false;
      }
      // Admin can edit themselves or other admins
      return currentUser.id === targetUser.id || targetUser.role === 'Admin';
    }
    
    return false;
  };

  // Check if current user can delete a specific user
  const canDeleteUser = (targetUser) => {
    if (!currentUser) return false;
    
    // Cannot delete yourself
    if (currentUser.id === targetUser.id) {
      return false;
    }
    
    // Owner can delete anyone except themselves
    if (currentUser.role === 'Owner') {
      return true;
    }
    
    // Admin can only delete other admins (not owners)
    if (currentUser.role === 'Admin') {
      // Admin cannot delete owners
      if (targetUser.role === 'Owner') {
        return false;
      }
      // Admin can delete other admins
      return targetUser.role === 'Admin';
    }
    
    return false;
  };

  // Check if current user can toggle status of a specific user
  const canToggleStatus = (targetUser) => {
    if (!currentUser) return false;
    
    // Cannot toggle your own status
    if (currentUser.id === targetUser.id) {
      return false;
    }
    
    // Owner can toggle anyone's status except themselves
    if (currentUser.role === 'Owner') {
      return true;
    }
    
    // Admin can only toggle other admins' status (not owners)
    if (currentUser.role === 'Admin') {
      // Admin cannot toggle owners' status
      if (targetUser.role === 'Owner') {
        return false;
      }
      // Admin can toggle other admins' status
      return targetUser.role === 'Admin';
    }
    
    return false;
  };

  const handleEdit = (user) => {
    if (!canEditUser(user)) {
      if (user.role === 'Owner' && currentUser?.role !== 'Owner') {
        alert('Samo Owner može uređivati Owner naloge');
      } else if (user.role === 'Admin' && currentUser?.role === 'Admin' && currentUser.id !== user.id) {
        alert('Admin može uređivati samo svoj profil');
      }
      return;
    }

    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id, username) => {
    const user = users.find(u => u.id === id);
    if (!user || !canDeleteUser(user)) {
      if (user?.role === 'Owner' && currentUser?.role !== 'Owner') {
        alert('Samo Owner može brisati Owner naloge');
      } else if (currentUser?.id === id) {
        alert('Ne možete obrisati svoj nalog');
      } else {
        alert('Nemate dozvolu za brisanje ovog korisnika');
      }
      return;
    }
    
    setUserToDelete({ id, username });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await usersApi.delete(userToDelete.id);
      loadUsers();
    } catch (error) {
      alert('Greška pri brisanju admina');
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const toggleUserStatus = async (user) => {
    if (!canToggleStatus(user)) {
      if (user.role === 'Owner' && currentUser?.role !== 'Owner') {
        alert('Samo Owner može mijenjati status Owner naloga');
      } else if (currentUser?.id === user.id) {
        alert('Ne možete mijenjati status svog naloga');
      } else {
        alert('Nemate dozvolu za mijenjanje statusa ovog korisnika');
      }
      return;
    }

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

  const getRoleColor = (role) => {
    return role === 'Owner' ? '#dc2626' : '#3b82f6';
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#22c55e' : '#ef4444';
  };

  const getPermissionText = (user) => {
    if (user.role === 'Owner' && currentUser?.role !== 'Owner') {
      return 'Samo Owner može upravljati';
    }
    
    if (user.role === 'Admin' && currentUser?.role === 'Admin' && currentUser.id !== user.id) {
      return 'Samo pregled';
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Brisanje admina"
        message={`Jeste li sigurni da želite obrisati admina "${userToDelete?.username}"?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
      />

      <div>
        <div className="admin-header">
          <h1>Upravljanje adminima</h1>
          <button
            className="btn btn-primary"
            onClick={() => {
              // Check if current user can create new users
              if (currentUser?.role === 'Admin') {
                alert('Samo Owner može kreirati nove admine');
                return;
              }
              
              setEditingUser(null);
              setFormData({ username: '', password: '', fullName: '', email: '', isActive: true });
              setShowModal(true);
            }}
            disabled={currentUser?.role === 'Admin'}
          >
            <Plus size={18} />
            <span className="desktop-only">Novi admin</span>
            <span className="mobile-only">Dodaj</span>
          </button>
        </div>

        {users.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="table-container desktop-only">
              <table className="table">
                <thead>
                  <tr>
                    <th>Korisničko ime</th>
                    <th>Puno ime</th>
                    <th>Email</th>
                    <th>Rola</th>
                    <th>Status</th>
                    <th style={{ width: '150px' }}>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const permissionText = getPermissionText(user);
                    const canEdit = canEditUser(user);
                    const canDelete = canDeleteUser(user);
                    const canToggle = canToggleStatus(user);

                    return (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="var(--text-secondary)" />
                            <strong>{user.username}</strong>
                            {currentUser?.id === user.id && (
                              <span className="status-badge" style={{ 
                                fontSize: '0.7rem',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6'
                              }}>
                                Ti
                              </span>
                            )}
                          </div>
                        </td>
                        <td>{user.fullName}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} color="var(--text-secondary)" />
                            {user.email}
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role)
                            }}
                          >
                            <Shield size={12} style={{ marginRight: '0.25rem' }} />
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${getStatusColor(user.isActive)}20`,
                              color: getStatusColor(user.isActive)
                            }}
                          >
                            {user.isActive ? 'Aktivan' : 'Neaktivan'}
                          </span>
                        </td>
                        <td>
                          {permissionText ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {permissionText}
                            </span>
                          ) : (
                            <div className="table-actions">
                              {canEdit && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleEdit(user)}
                                  title="Uredi"
                                >
                                  <Edit size={16} />
                                </button>
                              )}
                              {canToggle && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => toggleUserStatus(user)}
                                  title={user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                                >
                                  {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteClick(user.id, user.username)}
                                  title="Obriši"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-card-list">
              {users.map((user) => {
                const permissionText = getPermissionText(user);
                const canEdit = canEditUser(user);
                const canDelete = canDeleteUser(user);
                const canToggle = canToggleStatus(user);

                return (
                  <div key={user.id} className="mobile-card">
                    <div className="mobile-card-header">
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: getRoleColor(user.role),
                              flexShrink: 0
                            }}
                          />
                          <span
                            className="status-badge"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: `${getRoleColor(user.role)}20`,
                              color: getRoleColor(user.role)
                            }}
                          >
                            <Shield size={10} style={{ marginRight: '0.25rem' }} />
                            {user.role}
                          </span>
                          {currentUser?.id === user.id && (
                            <span className="status-badge" style={{ 
                              fontSize: '0.6rem',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6'
                            }}>
                              Ti
                            </span>
                          )}
                        </div>
                        <h3 className="mobile-card-title">
                          <User size={14} style={{ marginRight: '0.5rem' }} />
                          {user.username}
                        </h3>
                      </div>
                    </div>

                    <div className="mobile-card-details">
                      <span>
                        <User size={14} />
                        {user.fullName}
                      </span>
                      <span>
                        <Mail size={14} />
                        {user.email}
                      </span>
                      <span
                        style={{
                          color: getStatusColor(user.isActive),
                          fontWeight: '600'
                        }}
                      >
                        {user.isActive ? '✓ Aktivan' : '✗ Neaktivan'}
                      </span>
                    </div>

                    {/* Actions */}
                    {permissionText ? (
                      <div className="mobile-card-details">
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {permissionText}
                        </span>
                      </div>
                    ) : (
                      <div className="mobile-card-actions">
                        {canEdit && (
                          <button className="btn btn-secondary" onClick={() => handleEdit(user)}>
                            <Edit size={16} />
                            Uredi
                          </button>
                        )}
                        {canToggle && (
                          <button className="btn btn-secondary" onClick={() => toggleUserStatus(user)}>
                            {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            {user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteClick(user.id, user.username)}
                          >
                            <Trash2 size={16} />
                            Obriši
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <User size={48} color="var(--text-secondary)" />
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Nema admina za prikaz</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (currentUser?.role === 'Admin') {
                  alert('Samo Owner može kreirati nove admine');
                  return;
                }
                
                setEditingUser(null);
                setFormData({ username: '', password: '', fullName: '', email: '', isActive: true });
                setShowModal(true);
              }}
              disabled={currentUser?.role === 'Admin'}
            >
              <Plus size={18} />
              Dodaj prvog admina
            </button>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
              <h2
                style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {editingUser ? (
                  <>
                    <Edit size={20} />
                    Uredi admina
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Novi admin
                  </>
                )}
              </h2>

              <form onSubmit={handleSubmit}>
                {!editingUser && (
                  <>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} />
                        Korisničko ime *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                        placeholder="unesite korisničko ime"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Key size={16} />
                        Lozinka *
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        required
                        placeholder="unesite lozinku"
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
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    placeholder="unesite puno ime"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} />
                    Email *
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="unesite email adresu"
                  />
                </div>

                {editingUser && (
                  <div className="form-group">
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        style={{ marginRight: '0.5rem' }}
                      />
                      Aktivan nalog
                    </label>
                    <small className="text-muted">
                      Ako je deaktiviran, admin se ne može prijaviti
                    </small>
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUser(null);
                      setFormData({
                        username: '',
                        password: '',
                        fullName: '',
                        email: '',
                        isActive: true
                      });
                    }}
                  >
                    Otkaži
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Ažuriraj' : 'Sačuvaj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminUsers;