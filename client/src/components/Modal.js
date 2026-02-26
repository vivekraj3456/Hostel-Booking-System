import React from 'react';
import ReactModal from 'react-modal';
import { MdClose } from 'react-icons/md';

ReactModal.setAppElement('#root');

function Modal({ isOpen, onClose, title, children, actions }) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="modal-header">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close">
          <MdClose />
        </button>
      </div>
      {children}
      <div className="modal-actions">{actions}</div>
    </ReactModal>
  );
}

export default Modal;