import type { ReactNode, SelectHTMLAttributes } from 'react';
import './ui.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode;
}

export function Select({ label, id, className, children, ...rest }: SelectProps) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} className={['select', className].filter(Boolean).join(' ')} {...rest}>
        {children}
      </select>
    </div>
  );
}
