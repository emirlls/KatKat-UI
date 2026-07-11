import type { ReactNode } from 'react';
import './ui.css';

export function Badge({ tone = 'default', children }: { tone?: 'default' | 'success' | 'danger'; children: ReactNode }) {
  const className = tone === 'default' ? 'badge' : `badge badge-${tone}`;
  return <span className={className}>{children}</span>;
}
