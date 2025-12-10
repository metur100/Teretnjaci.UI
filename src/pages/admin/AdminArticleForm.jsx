import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { articlesApi, categoriesApi, imagesApi } from '../../services/api';
import { Save, ArrowLeft, Upload, X, Star } from 'lucide-react';

// Custom Confirmation Dialog Component with hideCancel prop
const ConfirmationDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = "danger", 
  confirmText = "Potvrdi", 
  cancelText = "Otkaži",
  hideCancel = false 
}) => {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case 'danger': return 'btn-danger';
      case 'warning': return 'btn-warning';
      case 'success': return 'btn-success';
      case 'info': return 'btn-info';
      default: return 'btn-primary';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          {!hideCancel && (
            <button className="btn btn-secondary" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button className={`btn ${getButtonColor()}`} onClick={onConfirm}>
            {confirmText}
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
  
  // Dialog states
  const [showDeleteImageDialog, setShowDeleteImageDialog] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'OK'
  });

  const [imageToDelete, setImageToDelete] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Helper functions for showing dialogs
  const showError = (message) => {
    setDialogConfig({
      title: 'Greška',
      message,
      type: 'danger',
      confirmText: 'OK'
    });
    setShowErrorDialog(true);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessDialog(true);
  };

  const showValidationError = (message) => {
    setDialogConfig({
      title: 'Obavezna polja',
      message,
      type: 'warning',
      confirmText: 'U redu'
    });
    setShowValidationDialog(true);
  };

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
      showError('Greška pri učitavanju kategorija');
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
      showError('Greška pri učitavanju članka');
    } finally {
      setLoading(false);
    }
  }, [id, initialLoad]);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadArticle();
    }
  }, [isEdit, loadCategories, loadArticle]);

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
      showValidationError('Naslov je obavezno polje');
      return;
    }
    
    if (!formData.content.trim()) {
      showValidationError('Sadržaj je obavezno polje');
      return;
    }
    
    if (!formData.categoryId) {
      showValidationError('Molimo odaberite kategoriju');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await articlesApi.update(id, formData);
        setHasUnsavedChanges(false);
        showSuccess('Članak je uspješno ažuriran');
        setTimeout(() => {
          navigate('/admin/clanci');
        }, 1500);
      } else {
        const response = await articlesApi.create(formData);
        const newArticleId = response.data.data.id;
        setArticleId(newArticleId);
        setHasUnsavedChanges(false);
        showSuccess('Članak je uspješno kreiran');
        setTimeout(() => {
          navigate('/admin/clanci');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      showError('Greška pri čuvanju članka: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!articleId) {
      showError('Molimo prvo sačuvajte članak prije dodavanja slika');
      return;
    }

    setUploading(true);
    
    const uploadPromises = files.map(async (file) => {
      try {
        const response = await imagesApi.upload(articleId, file);
        return response.data.data;
      } catch (error) {
        console.error('Error uploading image:', error);
        showError(`Greška pri učitavanju slike ${file.name}`);
        return null;
      }
    });

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      const validImages = uploadedImages.filter(img => img !== null);
      setImages(prev => [...prev, ...validImages]);
      if (validImages.length > 0) {
        showSuccess(`${validImages.length} slika je uspješno dodano`);
      }
    } catch (error) {
      console.error('Error during image upload:', error);
      showError('Greška pri učitavanju slika');
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
      showSuccess('Glavna slika je uspješno postavljena');
    } catch (error) {
      console.error('Error setting primary image:', error);
      showError('Greška pri postavljanju glavne slike');
    }
  };

  const handleDeleteImageClick = (imageId) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    setImageToDelete(imageId);
    setDialogConfig({
      title: 'Brisanje slike',
      message: `Jeste li sigurni da želite obrisati sliku "${image.fileName}"?`,
      type: 'warning'
    });
    setShowDeleteImageDialog(true);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    
    try {
      await imagesApi.delete(imageToDelete);
      setImages(prev => prev.filter(img => img.id !== imageToDelete));
      showSuccess('Slika je uspješno obrisana');
    } catch (error) {
      console.error('Error deleting image:', error);
      showError('Greška pri brisanju slike');
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
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
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
        type="warning"
        onConfirm={() => {
          setShowUnsavedChangesDialog(false);
          navigate('/admin/clanci');
        }}
        onCancel={() => setShowUnsavedChangesDialog(false)}
      />

      {/* Error Dialog - Hide cancel for simple notifications */}
      <ConfirmationDialog
        isOpen={showErrorDialog}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        confirmText={dialogConfig.confirmText}
        onConfirm={() => setShowErrorDialog(false)}
        onCancel={() => setShowErrorDialog(false)}
        hideCancel={true}
      />

      {/* Success Dialog - Hide cancel for success messages */}
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

      {/* Validation Dialog - Hide cancel for simple notifications */}
      <ConfirmationDialog
        isOpen={showValidationDialog}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        confirmText={dialogConfig.confirmText}
        onConfirm={() => setShowValidationDialog(false)}
        onCancel={() => setShowValidationDialog(false)}
        hideCancel={true}
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

            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminArticleForm;