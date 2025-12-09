import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { articlesApi } from '../../services/api';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

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

const AdminArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, [page, filter]);

// In your AdminArticles.jsx, update loadArticles function:
const loadArticles = async () => {
  try {
    setLoading(true);
    
    const params = {
      page,
      pageSize: 20
    };
    
    // Add filter for admin (only show drafts for admin users)
    if (filter === 'published') {
      params.isPublished = true;
    } else if (filter === 'draft') {
      params.isPublished = false;
    }
    
    // Use getAllAdmin instead of getAll
    const response = await articlesApi.getAllAdmin(params);
    setArticles(response.data.data);
    setTotalPages(response.data.totalPages);
  } catch (error) {
    console.error('Error loading articles:', error);
  } finally {
    setLoading(false);
  }
};

  const handleDeleteClick = (id, title) => {
    setArticleToDelete({ id, title });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;
    
    try {
      await articlesApi.delete(articleToDelete.id);
      loadArticles();
    } catch (error) {
      alert('Greška pri brisanju članka');
    } finally {
      setShowDeleteDialog(false);
      setArticleToDelete(null);
    }
  };

  const formatDate = (article) => {
    if (article.publishedAt) {
      return format(new Date(article.publishedAt), 'd. MMM yyyy', { locale: hr });
    }
    return format(new Date(article.createdAt), 'd. MMM yyyy', { locale: hr });
  };

  const getStatusColor = (isPublished) => {
    return isPublished ? '#22c55e' : '#f59e0b';
  };

  const getStatusText = (isPublished) => {
    return isPublished ? 'Objavljeno' : 'Draft';
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
      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Brisanje članka"
        message={`Jeste li sigurni da želite obrisati članak "${articleToDelete?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setArticleToDelete(null);
        }}
      />

      <div>
        <div className="admin-header">
          <h1>Upravljanje člancima</h1>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/clanci/novi')}
          >
            <Plus size={18} />
            Novi članak
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs" style={{ marginBottom: '2rem' }}>
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Svi članci
          </button>
          <button
            className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
            onClick={() => setFilter('published')}
          >
            Objavljeni
          </button>
          <button
            className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
            onClick={() => setFilter('draft')}
          >
            Draftovi
          </button>
        </div>

        {articles.length > 0 ? (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Naslov</th>
                    <th>Kategorija</th>
                    <th>Autor</th>
                    <th>Pregledi</th>
                    <th>Datum</th>
                    <th>Status</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id} className={!article.isPublished ? 'draft-row' : ''}>
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          {!article.isPublished && (
                            <FileText size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                          )}
                          <div>
                            <strong>{article.title}</strong>
                            {article.summary && (
                              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
                                {article.summary.length > 100 ? `${article.summary.substring(0, 100)}...` : article.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{article.categoryName}</span>
                      </td>
                      <td>{article.authorName}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Eye size={14} />
                          {article.viewCount}
                        </span>
                      </td>
                      <td>
                        {formatDate(article)}
                        {!article.isPublished && (
                          <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
                            (draft)
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="status-badge" style={{ 
                          backgroundColor: `${getStatusColor(article.isPublished)}20`,
                          color: getStatusColor(article.isPublished)
                        }}>
                          {getStatusText(article.isPublished)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => navigate(`/admin/clanci/uredi/${article.id}`)}
                            style={{ padding: '0.5rem' }}
                            title="Uredi"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteClick(article.id, article.title)}
                            style={{ padding: '0.5rem' }}
                            title="Obriši"
                          >
                            <Trash2 size={16} />
                          </button>
                          {article.isPublished && (
                            <button
                              className="btn btn-outline"
                              onClick={() => window.open(`/clanak/${article.slug}`, '_blank')}
                              style={{ padding: '0.5rem' }}
                              title="Pogledaj članak"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {page > 1 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(page - 1)}
                  >
                    Prethodna
                  </button>
                )}
                <span className="page-info">
                  Stranica {page} od {totalPages}
                </span>
                {page < totalPages && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPage(page + 1)}
                  >
                    Sljedeća
                </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <FileText size={48} color="var(--text-secondary)" />
            <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
              {filter === 'all' && 'Nema članaka za prikaz'}
              {filter === 'published' && 'Nema objavljenih članaka'}
              {filter === 'draft' && 'Nema draft članaka'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/admin/clanci/novi')}
            >
              <Plus size={18} />
              Kreiraj novi članak
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminArticles;