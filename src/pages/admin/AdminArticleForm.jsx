import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { articlesApi, categoriesApi, imagesApi } from "../../services/api";
import { Save, ArrowLeft, Upload, X, Star, Info } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Suppress React Quill findDOMNode warning
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
    return;
  }
  originalError(...args);
};

// Custom Confirmation Dialog Component
const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  type = "danger",
  confirmText = "Potvrdi",
  cancelText = "Otkaži",
  hideCancel = false,
}) => {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case "danger":
        return "btn-danger";
      case "warning":
        return "btn-warning";
      case "success":
        return "btn-success";
      case "info":
        return "btn-info";
      default:
        return "btn-primary";
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
  const quillRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    isPublished: true,
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
    title: "",
    message: "",
    type: "danger",
    confirmText: "OK",
  });

  const [imageToDelete, setImageToDelete] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Helper functions for showing dialogs
  const showError = (message) => {
    console.error("Error:", message);
    setDialogConfig({
      title: "Greška",
      message,
      type: "danger",
      confirmText: "OK",
    });
    setShowErrorDialog(true);
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccessDialog(true);
  };

  const showValidationError = (message) => {
    setDialogConfig({
      title: "Obavezna polja",
      message,
      type: "warning",
      confirmText: "U redu",
    });
    setShowValidationDialog(true);
  };

  // Image handler for Quill editor
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('Slika je prevelika. Maksimalna veličina je 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        showError('Nepodržan format slike. Dozvoljeni formati: JPEG, PNG, GIF, WebP');
        return;
      }

      try {
        setUploading(true);
        
        // Upload to ImgBB
        const response = await imagesApi.uploadInline(file);
        
        if (response.data.success) {
          const imageUrl = response.data.data.url;
          
          // Insert image into editor
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', imageUrl);
          quill.setSelection(range.index + 1);
          
          showSuccess('Slika je uspješno dodana');
        } else {
          showError('Greška pri učitavanju slike');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Nepoznata greška';
        showError('Greška pri učitavanju slike: ' + errorMessage);
      } finally {
        setUploading(false);
      }
    };
  }, []);

  // Quill modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data);
      if (!isEdit && response.data.data.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({
          ...prev,
          categoryId: response.data.data[0].id,
        }));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      showError("Greška pri učitavanju kategorija");
    }
  }, [isEdit, formData.categoryId]);

  // Load article for editing
  const loadArticle = useCallback(async () => {
    if (!id || initialLoad) return;

    try {
      setLoading(true);
      const response = await articlesApi.getById(id);
      const article = response.data.data;

      console.log("Loaded article:", article);

      setFormData({
        title: article.title || "",
        content: article.content || "",
        categoryId: article.categoryId || "",
        isPublished: article.isPublished || false,
      });

      // Handle images - ensure URLs are complete
      const formattedImages = (article.images || []).map(img => ({
        ...img,
        url: img.url || img.filePath || ""
      }));

      setImages(formattedImages);
      setArticleId(article.id);
      setInitialLoad(true);
    } catch (error) {
      console.error("Error loading article:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Nepoznata greška';
      showError("Greška pri učitavanju članka: " + errorMessage);
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
      navigate("/admin/clanci");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      showValidationError("Naslov je obavezno polje");
      return;
    }

    if (!formData.content.trim() || formData.content === '<p><br></p>') {
      showValidationError("Sadržaj je obavezno polje");
      return;
    }

    if (!formData.categoryId) {
      showValidationError("Molimo odaberite kategoriju");
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        await articlesApi.update(id, formData);
        setHasUnsavedChanges(false);
        showSuccess("Članak je uspješno ažuriran");
        setTimeout(() => {
          navigate("/admin/clanci");
        }, 1500);
      } else {
        const response = await articlesApi.create(formData);
        const newArticleId = response.data.data.id;
        setArticleId(newArticleId);
        setHasUnsavedChanges(false);
        showSuccess("Članak je uspješno kreiran");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Nepoznata greška';
      showError("Greška pri čuvanju članka: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle featured image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!articleId) {
      showError("Molimo prvo sačuvajte članak prije dodavanja slika");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      showError(`Neke slike su prevelike. Maksimalna veličina je 10MB`);
      setUploading(false);
      e.target.value = "";
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      showError(`Neke slike imaju nepodržan format. Dozvoljeni formati: JPEG, PNG, GIF, WebP`);
      setUploading(false);
      e.target.value = "";
      return;
    }

    const uploadedImages = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round((i / files.length) * 100));
      
      try {
        const response = await imagesApi.upload(articleId, file);
        if (response.data.success) {
          uploadedImages.push(response.data.data);
        } else {
          showError(`Greška pri učitavanju slike ${file.name}: ${response.data.message}`);
        }
      } catch (error) {
        console.error(`Error uploading image ${file.name}:`, error);
        const errorMessage = error.response?.data?.message || error.message || 'Nepoznata greška';
        showError(`Greška pri učitavanju slike ${file.name}: ${errorMessage}`);
      }
    }

    if (uploadedImages.length > 0) {
      setImages((prev) => [...prev, ...uploadedImages]);
      showSuccess(`${uploadedImages.length} slika je uspješno dodano`);
    }

    setUploading(false);
    setUploadProgress(100);
    setTimeout(() => setUploadProgress(0), 1000);
    e.target.value = "";
  };

  // Set image as primary
  const handleSetPrimary = async (imageId) => {
    try {
      await imagesApi.setPrimary(imageId);
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }))
      );
      showSuccess("Glavna slika je uspješno postavljena");
    } catch (error) {
      console.error("Error setting primary image:", error);
      showError("Greška pri postavljanju glavne slike");
    }
  };

  // Handle delete image click
  const handleDeleteImageClick = (imageId) => {
    const image = images.find((img) => img.id === imageId);
    if (!image) return;

    setImageToDelete(imageId);
    setDialogConfig({
      title: "Brisanje slike",
      message: `Jeste li sigurni da želite obrisati sliku "${image.fileName}"? Ova akcija će ukloniti sliku iz baze podataka.`,
      type: "warning",
    });
    setShowDeleteImageDialog(true);
  };

  // Confirm image deletion
  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;

    try {
      await imagesApi.delete(imageToDelete);
      setImages((prev) => prev.filter((img) => img.id !== imageToDelete));
      showSuccess("Slika je uklonjena iz baze podataka");
    } catch (error) {
      console.error("Error deleting image:", error);
      showError("Greška pri brisanju slike");
    } finally {
      setShowDeleteImageDialog(false);
      setImageToDelete(null);
    }
  };

  // Loading state
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
      {/* Confirmation Dialogs */}
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

      <ConfirmationDialog
        isOpen={showUnsavedChangesDialog}
        title="Nesačuvane promjene"
        message="Imate nesačuvane promjene. Da li ste sigurni da želite napustiti stranicu?"
        type="warning"
        onConfirm={() => {
          setShowUnsavedChangesDialog(false);
          navigate("/admin/clanci");
        }}
        onCancel={() => setShowUnsavedChangesDialog(false)}
      />

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
          <h1>{isEdit ? "Uredi članak" : "Novi članak"}</h1>
          <button className="btn btn-secondary" onClick={handleBackClick}>
            <ArrowLeft size={18} />
            Nazad
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gap: "1.5rem", maxWidth: "1200px" }}>
            <div className="form-group">
              <label>Naslov *</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Kategorija *</label>
              <select
                className="form-control"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
                disabled={loading || categories.length === 0}
              >
                {categories.length === 0 ? (
                  <option value="">Učitavanje kategorija...</option>
                ) : (
                  <>
                    <option value="">Izaberite kategoriju</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="form-group">
              <label>
                Sadržaj *
                {uploading && (
                  <span style={{ marginLeft: '1rem', color: 'var(--warning)' }}>
                    Učitavanje slike...
                  </span>
                )}
              </label>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                modules={modules}
                formats={formats}
                placeholder="Počnite pisati sadržaj članka... Možete paste slike direktno ili koristiti dugme za dodavanje slika."
                style={{
                  height: '500px',
                  marginBottom: '3rem'
                }}
                readOnly={loading}
              />
            </div>

            <div className="form-group">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  disabled={loading}
                />
                Objavi odmah
              </label>
              <small className="text-muted">
                Ako je označeno, članak će biti javno dostupan odmah nakon
                čuvanja.
              </small>
            </div>

            {/* Featured Images Section */}
            {articleId && (
              <div className="form-group">
                <label>Istaknute slike (za galeriju)</label>
                <div
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-secondary)',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <Info size={14} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Ove slike će se prikazati u galeriji na detaljnoj stranici članka. 
                    Za slike unutar sadržaja koristite editor iznad.
                  </p>
                </div>
                
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploading || loading}
                    style={{ display: "none" }}
                    id="featured-image-upload"
                  />
                  <label
                    htmlFor="featured-image-upload"
                    className={`btn ${
                      uploading ? "btn-disabled" : "btn-secondary"
                    }`}
                    style={{
                      cursor: uploading ? "not-allowed" : "pointer",
                      margin: 0,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Upload size={18} />
                    {uploading ? "Učitavanje..." : "Dodaj istaknute slike"}
                  </label>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Maksimalno 10MB po slici
                  </span>
                  
                  {uploading && uploadProgress > 0 && (
                    <div style={{ 
                      flex: 1,
                      minWidth: "200px",
                      background: "var(--bg-secondary)",
                      borderRadius: "4px",
                      height: "8px",
                      overflow: "hidden"
                    }}>
                      <div 
                        style={{ 
                          width: `${uploadProgress}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, var(--primary), var(--accent))",
                          transition: "width 0.3s ease",
                          borderRadius: "4px"
                        }}
                      />
                    </div>
                  )}
                </div>

                {images.length > 0 && (
                  <div className="image-grid">
                    {images.map((image) => (
                      <div key={image.id} className="image-preview">
                        <img
                          src={image.url}
                          alt={image.fileName}
                          className="image-thumbnail"
                          onError={(e) => {
                            console.error("Image load error:", image.url);
                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' text-anchor='middle' dy='.3em' fill='%23999'%3ESlika nije dostupna%3C/text%3E%3C/svg%3E";
                          }}
                          loading="lazy"
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
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || categories.length === 0}
              >
                <Save size={18} />
                {loading ? "Čuvanje..." : isEdit ? "Ažuriraj" : "Sačuvaj"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBackClick}
                disabled={loading}
              >
                {isEdit ? "Nazad" : "Otkaži"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminArticleForm;