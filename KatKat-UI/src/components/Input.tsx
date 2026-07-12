import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import './ui.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
    </svg>
  );
}

export function Input({ label, error, id, className, type, ...rest }: InputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && visible ? 'text' : type;

  const inputEl = (
    <input
      id={id}
      type={effectiveType}
      className={['input', isPassword && 'input-with-toggle', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );

  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      {isPassword ? (
        <div className="input-wrapper">
          {inputEl}
          <button
            type="button"
            className="input-toggle"
            aria-label={visible ? 'Parolayı gizle' : 'Parolayı göster'}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      ) : (
        inputEl
      )}
      {error && <span className="error-banner">{error}</span>}
    </div>
  );
}
