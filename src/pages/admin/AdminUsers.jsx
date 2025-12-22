import { useState, useEffect } from 'react';
import { usersApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, UserCheck, UserX, Mail, User, Shield, Key, Settings } from 'lucide-react';
import ConfirmationDialog from '../../components/ConfirmationDialog';

// Helper function to safely get user properties
const getUserProperty = (user, prop) => {
  if (!user) return "";
  return user[prop] || 
         user[prop.charAt(0).toUpperCase() + prop.slice(1)] || 
         user[prop.toLowerCase()] || "";
};

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

    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Also ensure body scroll is reset
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

const loadUsers = async () => {
  try {
    setLoading(true);
    const response = await usersApi.getAll();
    const responseData = response.data || {};
    let usersData = [];
    
    if (Array.isArray(responseData)) {
      usersData = responseData;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      usersData = responseData.data;
    } else if (responseData.Data && Array.isArray(responseData.Data)) {
      usersData = responseData.Data;
    } else if (responseData.users && Array.isArray(responseData.users)) {
      usersData = responseData.users;
    } else if (responseData.Users && Array.isArray(responseData.Users)) {
      usersData = responseData.Users;
    } else {
      const allKeys = Object.keys(responseData);
      for (const key of allKeys) {
        if (Array.isArray(responseData[key])) {
          usersData = responseData[key];
          break;
        }
      }
    }

    setUsers(Array.isArray(usersData) ? usersData : []);
  } catch (error) {
    console.error('Error loading users:', error);
    showError('Greška pri učitavanju korisnika');
    setUsers([]);
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
        const editingUserId = getUserProperty(editingUser, 'id');
        const userData = {
          fullName: formData.fullName,
          email: formData.email,
          isActive: formData.isActive
        };
        
        if (editingUserId !== currentUser?.id && formData.username !== getUserProperty(editingUser, 'username')) {
          userData.username = formData.username;
        }
        
        if (editingUserId !== currentUser?.id && formData.role !== getUserProperty(editingUser, 'role')) {
          userData.role = formData.role;
        }
        
        await usersApi.update(editingUserId, userData);
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
      const errorMsg = error.response?.data?.message || error.response?.data?.Message || 'Greška pri čuvanju korisnika';
      showError(errorMsg);
    }
  };

  const canEditUser = (targetUser) => {
    if (!currentUser) return false;
    const currentUserId = getUserProperty(currentUser, 'id');
    const targetUserId = getUserProperty(targetUser, 'id');
    const currentUserRole = getUserProperty(currentUser, 'role');
    
    if (currentUserRole === 'Owner') {
      return true;
    }
    
    if (currentUserRole === 'Admin') {
      return currentUserId === targetUserId;
    }
    
    return false;
  };

  const canDeleteUser = (targetUser) => {
    if (!currentUser) return false;
    const currentUserId = getUserProperty(currentUser, 'id');
    const targetUserId = getUserProperty(targetUser, 'id');
    const currentUserRole = getUserProperty(currentUser, 'role');
    
    if (currentUserId === targetUserId) {
      return false;
    }
    
    if (currentUserRole === 'Owner') {
      return true;
    }
    
    return false;
  };

  const canToggleStatus = (targetUser) => {
    if (!currentUser) return false;
    const currentUserId = getUserProperty(currentUser, 'id');
    const targetUserId = getUserProperty(targetUser, 'id');
    const currentUserRole = getUserProperty(currentUser, 'role');
    
    if (currentUserId === targetUserId) {
      return false;
    }
    
    if (currentUserRole === 'Owner') {
      return true;
    }
    
    return false;
  };

  const handleEdit = (user) => {
    if (!canEditUser(user)) {
      const currentUserId = getUserProperty(currentUser, 'id');
      const targetUserId = getUserProperty(user, 'id');
      const currentUserRole = getUserProperty(currentUser, 'role');
      
      if (currentUserRole === 'Admin' && currentUserId !== targetUserId) {
        showError('Admin može uređivati samo svoj profil');
      } else {
        showError('Nemate dozvolu za uređivanje ovog korisnika');
      }
      return;
    }

    setEditingUser(user);
    setFormData({
      username: getUserProperty(user, 'username'),
      fullName: getUserProperty(user, 'fullName'),
      email: getUserProperty(user, 'email'),
      role: getUserProperty(user, 'role'),
      isActive: getUserProperty(user, 'isActive') || true
    });
    setShowModal(true);
  };

  const handleEditCurrentUser = () => {
    setEditingUser(currentUser);
    setFormData({
      username: getUserProperty(currentUser, 'username'),
      fullName: getUserProperty(currentUser, 'fullName'),
      email: getUserProperty(currentUser, 'email'),
      role: getUserProperty(currentUser, 'role'),
      isActive: getUserProperty(currentUser, 'isActive') || true
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id, username) => {
    const user = users.find(u => getUserProperty(u, 'id') === id);
    if (!user || !canDeleteUser(user)) {
      const currentUserId = getUserProperty(currentUser, 'id');
      if (currentUserId === id) {
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
      const currentUserId = getUserProperty(currentUser, 'id');
      const targetUserId = getUserProperty(user, 'id');
      if (currentUserId === targetUserId) {
        showError('Ne možete mijenjati status svog naloga');
      } else {
        showError('Nemate dozvolu za mijenjanje statusa ovog korisnika');
      }
      return;
    }

    const username = getUserProperty(user, 'username');
    const isActive = getUserProperty(user, 'isActive') || false;
    
    setUserToToggle(user);
    setDialogConfig({
      title: isActive ? 'Deaktivacija korisnika' : 'Aktivacija korisnika',
      message: `Jeste li sigurni da želite ${isActive ? 'deaktivirati' : 'aktivirati'} korisnika "${username}"?`,
      type: 'warning'
    });
    setShowStatusDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    
    try {
      const userId = getUserProperty(userToToggle, 'id');
      const fullName = getUserProperty(userToToggle, 'fullName');
      const email = getUserProperty(userToToggle, 'email');
      const role = getUserProperty(userToToggle, 'role');
      const isActive = getUserProperty(userToToggle, 'isActive') || false;
      
      await usersApi.update(userId, {
        fullName,
        email,
        role,
        isActive: !isActive
      });
      loadUsers();
      showSuccess(`Status korisnika je uspješno ${isActive ? 'deaktiviran' : 'aktiviran'}`);
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
    const currentUserRole = getUserProperty(currentUser, 'role');
    const currentUserId = getUserProperty(currentUser, 'id');
    const targetUserId = getUserProperty(user, 'id');
    
    if (currentUserRole === 'Admin' && currentUserId !== targetUserId) {
      return 'Samo pregled';
    }
    
    return null;
  };

  const filteredUsers = users.filter(user => getUserProperty(user, 'id') !== getUserProperty(currentUser, 'id'));

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
            
            {getUserProperty(currentUser, 'role') === 'Owner' && (
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
                    const userId = getUserProperty(user, 'id');
                    const username = getUserProperty(user, 'username');
                    const fullName = getUserProperty(user, 'fullName');
                    const email = getUserProperty(user, 'email');
                    const role = getUserProperty(user, 'role');
                    const isActive = getUserProperty(user, 'isActive') || false;
                    const permissionText = getPermissionText(user);
                    const canEdit = canEditUser(user);
                    const canDelete = canDeleteUser(user);
                    const canToggle = canToggleStatus(user);

                    return (
                      <tr key={userId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} color="var(--text-secondary)" />
                            <strong>{username}</strong>
                          </div>
                        </td>
                        <td>{fullName}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} color="var(--text-secondary)" />
                            {email}
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${getRoleColor(role)}20`,
                              color: getRoleColor(role)
                            }}
                          >
                            <Shield size={12} style={{ marginRight: '0.25rem' }} />
                            {role}
                          </span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: `${getStatusColor(isActive)}20`,
                              color: getStatusColor(isActive)
                            }}
                          >
                            {isActive ? 'Aktivan' : 'Neaktivan'}
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
                                  title={isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                                >
                                  {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteClick(userId, username)}
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
                const userId = getUserProperty(user, 'id');
                const username = getUserProperty(user, 'username');
                const fullName = getUserProperty(user, 'fullName');
                const email = getUserProperty(user, 'email');
                const role = getUserProperty(user, 'role');
                const isActive = getUserProperty(user, 'isActive') || false;
                const permissionText = getPermissionText(user);
                const canEdit = canEditUser(user);
                const canDelete = canDeleteUser(user);
                const canToggle = canToggleStatus(user);

                return (
                  <div key={userId} className="mobile-card">
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
                              backgroundColor: getRoleColor(role),
                              flexShrink: 0
                            }}
                          />
                          <span
                            className="status-badge"
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: `${getRoleColor(role)}20`,
                              color: getRoleColor(role)
                            }}
                          >
                            <Shield size={10} style={{ marginRight: '0.25rem' }} />
                            {role}
                          </span>
                        </div>
                        <h3 className="mobile-card-title">
                          <User size={14} style={{ marginRight: '0.5rem' }} />
                          {username}
                        </h3>
                      </div>
                    </div>

                    <div className="mobile-card-details">
                      <span>
                        <User size={14} />
                        {fullName}
                      </span>
                      <span>
                        <Mail size={14} />
                        {email}
                      </span>
                      <span
                        style={{
                          color: getStatusColor(isActive),
                          fontWeight: '600'
                        }}
                      >
                        {isActive ? '✓ Aktivan' : '✗ Neaktivan'}
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
                            {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            {isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteClick(userId, username)}
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
            {getUserProperty(currentUser, 'role') === 'Owner' && (
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
                    {getUserProperty(editingUser, 'id') === getUserProperty(currentUser, 'id') ? 'Uredi svoj profil' : 'Uredi korisnika'}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Novi admin
                  </>
                )}
              </h2>

              <form onSubmit={handleSubmit}>
                {(!editingUser || getUserProperty(editingUser, 'id') !== getUserProperty(currentUser, 'id')) && (
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
                        disabled={editingUser && getUserProperty(editingUser, 'id') === getUserProperty(currentUser, 'id')}
                      />
                      {editingUser && getUserProperty(editingUser, 'id') === getUserProperty(currentUser, 'id') && (
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

                {(getUserProperty(currentUser, 'role') === 'Owner' && editingUser && getUserProperty(editingUser, 'id') !== getUserProperty(currentUser, 'id')) || !editingUser ? (
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

                {editingUser && getUserProperty(editingUser, 'id') !== getUserProperty(currentUser, 'id') && getUserProperty(currentUser, 'role') === 'Owner' && (
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