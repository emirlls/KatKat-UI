import type { ReactNode } from 'react';
import { Button } from './Button';
import './ui.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="page-header">
          <h2>{title}</h2>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Kapat
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
