import type { ReactNode } from 'react';
import './layouts.css';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1>KatKat</h1>
        {children}
      </div>
    </div>
  );
}
