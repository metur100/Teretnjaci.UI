import React from 'react';
const ConfirmationDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Potvrdi", 
  cancelText = "Otkaži",
  type = "danger",
  hideCancel = false,
  onConfirm, 
  onCancel 
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
        <h3 style={{ marginBottom: '1rem' }}>{title}</h3>
        <p style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>{message}</p>
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

export default ConfirmationDialog;