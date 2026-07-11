import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="page">
      <h1>Sayfa bulunamadı</h1>
      <p>
        <Link to="/">Panele dön</Link>
      </p>
    </div>
  );
}
