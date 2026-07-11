import type { InputHTMLAttributes, ReactNode } from 'react';
import './ui.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

export function Input({ label, error, id, className, ...rest }: InputProps) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} className={['input', className].filter(Boolean).join(' ')} {...rest} />
      {error && <span className="error-banner">{error}</span>}
    </div>
  );
}
