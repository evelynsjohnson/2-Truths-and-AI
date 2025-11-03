/**
 * @fileoverview Reusable Modal component for displaying overlay dialogs.
 */

import React from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, children, title, blocking = false }) {
  // blocking: when true the modal cannot be closed via overlay click or close button
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (!blocking && typeof onClose === 'function') onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            {!blocking && <button className="modal-close" onClick={onClose}>×</button>}
          </div>
        )}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
