import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesApi, categoriesApi, imagesApi } from '../../services/api';
import { Save, ArrowLeft, Upload, X, Star } from 'lucide-react';

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

const AdminArticleForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    categoryId: '',
    isPublished: true
  });
  
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [articleId, setArticleId] = useState(null);
  const [initialLoad, setInitialLoad] = useState(false);
  
  // Custom dialog states
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Memoize loadCategories to prevent unnecessary re-renders
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data);
      if (!isEdit && response.data.data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({ ...prev, categoryId: response.data.data[0].id }));
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [isEdit, formData.categoryId]);

  const loadArticle = useCallback(async () => {
    if (!id || initialLoad) return;
    
    try {
      setLoading(true);
      const response = await articlesApi.getById(id);
      const article = response.data.data;
      
      setFormData({
        title: article.title,
        content: article.content,
        summary: article.summary || '',
        categoryId: article.categoryId,
        isPublished: article.isPublished
      });
      
      setImages(article.images || []);
      setArticleId(article.id);
      setInitialLoad(true);
    } catch (error) {
      console.error('Error loading article:', error);
      alert('Greška pri učitavanju članka');
    } finally {
      setLoading(false);
    }
  }, [id, initialLoad]);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadArticle();
    }
  }, [isEdit, loadCategories, loadArticle]); // Fixed dependencies

  // Track form changes
  useEffect(() => {
    if (isEdit && initialLoad) {
      setHasUnsavedChanges(true);
    }
  }, [formData, isEdit, initialLoad]);

  // Handle back navigation with unsaved changes warning
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true);
    } else {
      navigate('/admin/clanci');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      alert('Naslov je obavezan');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('Sadržaj je obavezan');
      return;
    }
    
    if (!formData.categoryId) {
      alert('Kategorija je obavezna');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await articlesApi.update(id, formData);
        setHasUnsavedChanges(false);
        alert('Članak je uspješno ažuriran');
      } else {
        const response = await articlesApi.create(formData);
        const newArticleId = response.data.data.id;
        setArticleId(newArticleId);
        setHasUnsavedChanges(false);
        alert('Članak je uspješno kreiran');
      }
      
      navigate('/admin/clanci');
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Greška pri čuvanju članka: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!articleId) {
      alert('Molimo prvo sačuvajte članak prije dodavanja slika');
      return;
    }

    setUploading(true);
    
    const uploadPromises = files.map(async (file) => {
      try {
        const response = await imagesApi.upload(articleId, file);
        return response.data.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Greška pri učitavanju slike ${file.name}`);
        return null;
      }
    });

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(img => img !== null);
      setImages(prev => [...prev, ...validImages]);
    } catch (error) {
      console.error('Error during image upload:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await imagesApi.setPrimary(imageId);
      setImages(prev => prev.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      })));
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Greška pri postavljanju glavne slike');
    }
  };

  const handleDeleteImageClick = (imageId) => {
    setImageToDelete(imageId);
    setShowDeleteImageDialog(true);
  };

  const confirmDeleteImage = async () => {
    try {
      await imagesApi.delete(imageToDelete);
      setImages(prev => prev.filter(img => img.id !== imageToDelete));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Greška pri brisanju slike');
    } finally {
      setShowDeleteImageDialog(false);
      setImageToDelete(null);
    }
  };

  if (loading && isEdit && !initialLoad) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Učitavanje članka...</p>
      </div>
    );
  }

  return (
    <>
      {/* Delete Image Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteImageDialog}
        title="Brisanje slike"
        message="Jeste li sigurni da želite obrisati ovu sliku?"
        onConfirm={confirmDeleteImage}
        onCancel={() => {
          setShowDeleteImageDialog(false);
          setImageToDelete(null);
        }}
      />

      {/* Unsaved Changes Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showUnsavedChangesDialog}
        title="Nesačuvane promjene"
        message="Imate nesačuvane promjene. Da li ste sigurni da želite napustiti stranicu?"
        onConfirm={() => {
          setShowUnsavedChangesDialog(false);
          navigate('/admin/clanci');
        }}
        onCancel={() => setShowUnsavedChangesDialog(false)}
      />

      <div>
        <div className="admin-header">
          <h1>{isEdit ? 'Uredi članak' : 'Novi članak'}</h1>
          <button
            className="btn btn-secondary"
            onClick={handleBackClick}
          >
            <ArrowLeft size={18} />
            Nazad
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px' }}>
            <div className="form-group">
              <label>Naslov *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Kategorija *</label>
              <select
                className="form-control"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
                disabled={loading || categories.length === 0}
              >
                {categories.length === 0 ? (
                  <option value="">Učitavanje kategorija...</option>
                ) : (
                  <>
                    <option value="">Izaberite kategoriju</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>Sažetak (opcionalno)</label>
              <textarea
                className="form-control"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows="3"
                placeholder="Kratak sažetak članka koji će se prikazati na listi članaka..."
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Sadržaj *</label>
              <textarea
                className="form-control"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows="15"
                required
                placeholder="Sadržaj članka..."
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  disabled={loading}
                />
                Objavi odmah
              </label>
              <small className="text-muted">
                Ako je označeno, članak će biti javno dostupan odmah nakon čuvanja.
              </small>
            </div>

            {articleId && (
              <div className="form-group">
                <label>Slike</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || loading}
                    style={{ display: 'none' }}
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload" 
                    className={`btn ${uploading ? 'btn-disabled' : 'btn-secondary'}`}
                    style={{ cursor: uploading ? 'not-allowed' : 'pointer', margin: 0 }}
                  >
                    <Upload size={18} />
                    {uploading ? 'Učitavanje...' : 'Dodaj slike'}
                  </label>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {images.length} {images.length === 1 ? 'slika' : 'slika'}
                  </span>
                </div>

                {images.length > 0 && (
                  <div className="image-grid">
                    {images.map((image) => (
                      <div key={image.id} className="image-preview">
                        <img
                          src={image.url}
                          alt={image.fileName}
                          className="image-thumbnail"
                        />
                        {image.isPrimary && (
                          <div className="primary-badge">
                            <Star size={12} />
                            Glavna
                          </div>
                        )}
                        <div className="image-actions">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(image.id)}
                              className="image-action-btn"
                              title="Postavi kao glavnu sliku"
                              disabled={loading}
                            >
                              <Star size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteImageClick(image.id)}
                            className="image-action-btn delete"
                            disabled={loading}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {images.length === 0 && articleId && (
                  <div className="no-images">
                    <p>Nema dodanih slika. Dodajte slike za bolji prikaz članka.</p>
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || categories.length === 0}
              >
                <Save size={18} />
                {loading ? 'Čuvanje...' : (isEdit ? 'Ažuriraj' : 'Sačuvaj')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBackClick}
                disabled={loading}
              >
                {isEdit ? 'Nazad' : 'Otkaži'}
              </button>
              
              {isEdit && articleId && formData.isPublished && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => window.open(`/clanak/${formData.slug || ''}`, '_blank')}
                  disabled={loading}
                  style={{ marginLeft: 'auto' }}
                >
                  Pogledaj članak
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminArticleForm;