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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          {!hideCancel && (
            <button 
              className="btn btn-secondary" 
              onClick={onCancel}
              aria-label={cancelText}
            >
              {cancelText}
            </button>
          )}
          <button 
            className={`btn ${getButtonColor()}`} 
            onClick={onConfirm}
            aria-label={confirmText}
            autoFocus={!hideCancel}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;