import type { ReactNode, TextareaHTMLAttributes } from 'react';
import './ui.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
}

export function Textarea({ label, id, className, ...rest }: TextareaProps) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <textarea id={id} className={['textarea', className].filter(Boolean).join(' ')} rows={3} {...rest} />
    </div>
  );
}
