import { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, UserCheck, UserX, Mail, User, Shield, Key, Settings } from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'Admin',
    isActive: true
  });

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    type: 'danger'
  });

  const [userToDelete, setUserToDelete] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
      showError('Greška pri učitavanju korisnika');
    } finally {
      setLoading(false);
    }
  };

  const showError = (message) => {
    setDialogConfig({
      title: 'Greška',
      message,
      type: 'danger'
    });
    setShowErrorDialog(true);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          isActive: formData.isActive
        };
        
        if (editingUser.id !== currentUser.id && formData.username !== editingUser.username) {
          userData.username = formData.username;
        }
        
        if (editingUser.id !== currentUser.id && formData.role !== editingUser.role) {
          userData.role = formData.role;
        }
        
        await usersApi.update(editingUser.id, userData);
        showSuccess('Korisnik je uspješno ažuriran');
      } else {
        await usersApi.create({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role
        });
        showSuccess(`${formData.role} je uspješno kreiran`);
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({ 
        username: '', 
        password: '', 
        fullName: '', 
        email: '', 
        role: 'Admin', 
        isActive: true 
      });
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showError(error.response?.data?.message || 'Greška pri čuvanju korisnika');
    }
  };

  const canEditUser = (targetUser) => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'Owner') {
      return true;
    }
    
    if (currentUser.role === 'Admin') {
      return currentUser.id === targetUser.id;
    }
    
    return false;
  };

  const canDeleteUser = (targetUser) => {
    if (!currentUser) return false;
    
    if (currentUser.id === targetUser.id) {
      return false;
    }
    
    if (currentUser.role === 'Owner') {
      return true;
    }
    
    return false;
  };

  const canToggleStatus = (targetUser) => {
    if (!currentUser) return false;
    
    if (currentUser.id === targetUser.id) {
      return false;
    }
    
    if (currentUser.role === 'Owner') {
      return true;
    }
    
    return false;
  };

  const handleEdit = (user) => {
    if (!canEditUser(user)) {
      if (currentUser?.role === 'Admin' && currentUser.id !== user.id) {
        showError('Admin može uređivati samo svoj profil');
      } else {
        showError('Nemate dozvolu za uređivanje ovog korisnika');
      }
      return;
    }

    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleEditCurrentUser = () => {
    setEditingUser(currentUser);
    setFormData({
      username: currentUser.username,
      fullName: currentUser.fullName,
      email: currentUser.email,
      role: currentUser.role,
      isActive: currentUser.isActive
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id, username) => {
    const user = users.find(u => u.id === id);
    if (!user || !canDeleteUser(user)) {
      if (currentUser?.id === id) {
        showError('Ne možete obrisati svoj nalog');
      } else {
        showError('Nemate dozvolu za brisanje ovog korisnika');
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
      showSuccess('Korisnik je uspješno obrisan');
    } catch (error) {
      showError('Greška pri brisanju korisnika');
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleToggleStatusClick = (user) => {
    if (!canToggleStatus(user)) {
      if (currentUser?.id === user.id) {
        showError('Ne možete mijenjati status svog naloga');
      } else {
        showError('Nemate dozvolu za mijenjanje statusa ovog korisnika');
      }
      return;
    }

    setUserToToggle(user);
    setDialogConfig({
      title: user.isActive ? 'Deaktivacija korisnika' : 'Aktivacija korisnika',
      message: `Jeste li sigurni da želite ${user.isActive ? 'deaktivirati' : 'aktivirati'} korisnika "${user.username}"?`,
      type: 'warning'
    });
    setShowStatusDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    
    try {
      await usersApi.update(userToToggle.id, {
        fullName: userToToggle.fullName,
        email: userToToggle.email,
        role: userToToggle.role,
        isActive: !userToToggle.isActive
      });
      loadUsers();
      showSuccess(`Status korisnika je uspješno ${userToToggle.isActive ? 'deaktiviran' : 'aktiviran'}`);
    } catch (error) {
      showError('Greška pri ažuriranju statusa');
    } finally {
      setShowStatusDialog(false);
      setUserToToggle(null);
    }
  };

  const getRoleColor = (role) => {
    return role === 'Owner' ? '#dc2626' : '#3b82f6';
  };

  const getStatusColor = (isActive) => {
    return isActive ? '#22c55e' : '#ef4444';
  };

  const getPermissionText = (user) => {
    if (currentUser?.role === 'Admin' && currentUser.id !== user.id) {
      return 'Samo pregled';
    }
    
    return null;
  };

  const filteredUsers = users.filter(user => user.id !== currentUser?.id);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Brisanje korisnika"
        message={`Jeste li sigurni da želite obrisati korisnika "${userToDelete?.username}"?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
      />

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showStatusDialog}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        onConfirm={confirmToggleStatus}
        onCancel={() => {
          setShowStatusDialog(false);
          setUserToToggle(null);
        }}
      />

      {/* Error Dialog */}
      <ConfirmationDialog
        isOpen={showErrorDialog}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        confirmText="OK"
        onConfirm={() => setShowErrorDialog(false)}
        onCancel={() => setShowErrorDialog(false)}
        hideCancel={true}
      />

      {/* Success Dialog */}
      <ConfirmationDialog
        isOpen={showSuccessDialog}
        title="Uspjeh"
        message={successMessage}
        type="success"
        confirmText="OK"
        onConfirm={() => setShowSuccessDialog(false)}
        onCancel={() => setShowSuccessDialog(false)}
        hideCancel={true}
      />

      <div>
        <div className="admin-header">
          <h1>Upravljanje adminima</h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn-secondary"
              onClick={handleEditCurrentUser}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Settings size={18} />
              <span className="desktop-only">Uredi svoj profil</span>
              <span className="mobile-only">Moj profil</span>
            </button>
            
            {currentUser?.role === 'Owner' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingUser(null);
                  setFormData({ 
                    username: '', 
                    password: '', 
                    fullName: '', 
                    email: '', 
                    role: 'Admin',
                    isActive: true 
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={18} />
                <span className="desktop-only">Novi admin</span>
                <span className="mobile-only">Dodaj</span>
              </button>
            )}
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <>
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
                  {filteredUsers.map((user) => {
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
                                  onClick={() => handleToggleStatusClick(user)}
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

            <div className="mobile-card-list">
              {filteredUsers.map((user) => {
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
                          <button className="btn btn-secondary" onClick={() => handleToggleStatusClick(user)}>
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
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Nema drugih korisnika za prikaz</p>
            {currentUser?.role === 'Owner' && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingUser(null);
                  setFormData({ 
                    username: '', 
                    password: '', 
                    fullName: '', 
                    email: '', 
                    role: 'Admin',
                    isActive: true 
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={18} />
                Dodaj novog korisnika
              </button>
            )}
          </div>
        )}

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
                    {editingUser.id === currentUser?.id ? 'Uredi svoj profil' : 'Uredi korisnika'}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Novi admin
                  </>
                )}
              </h2>

              <form onSubmit={handleSubmit}>
                {(!editingUser || editingUser.id !== currentUser?.id) && (
                  <>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} />
                        Korisničko ime {!editingUser && '*'}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required={!editingUser}
                        placeholder="unesite korisničko ime"
                        disabled={editingUser?.id === currentUser?.id}
                      />
                      {editingUser?.id === currentUser?.id && (
                        <small className="text-muted">Korisničko ime se ne može mijenjati</small>
                      )}
                    </div>
                  </>
                )}

                {!editingUser && (
                  <>
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

                {(currentUser?.role === 'Owner' && editingUser?.id !== currentUser?.id) || !editingUser ? (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={16} />
                      Rola *
                    </label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      required
                    >
                      <option value="Admin">Admin</option>
                      <option value="Owner">Owner</option>
                    </select>
                    <small className="text-muted">
                      Owner ima potpune privilegije, Admin može samo uređivati svoj profil
                    </small>
                  </div>
                ) : (
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Shield size={16} />
                      Rola
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.role}
                      disabled
                    />
                    <small className="text-muted">Rolu može mijenjati samo drugi Owner</small>
                  </div>
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

                {editingUser && editingUser.id !== currentUser?.id && currentUser?.role === 'Owner' && (
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
                      Ako je deaktiviran, korisnik se ne može prijaviti
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
                        role: 'Admin',
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