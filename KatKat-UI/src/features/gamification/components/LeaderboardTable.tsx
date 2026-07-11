import type { LeaderboardDto } from '../../../types/complex';

export function LeaderboardTable({ entries }: { entries: LeaderboardDto[] }) {
  if (entries.length === 0) {
    return <p>Bu grupta henüz puanlanmış site yok.</p>;
  }
  return (
    <table className="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Site</th>
          <th>İlçe / Mahalle</th>
          {entries[0].distanceKm != null && <th>Mesafe</th>}
          <th>Puan</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.complexId}>
            <td>{entry.rank}</td>
            <td>{entry.complexName}</td>
            <td>
              {entry.district.name} / {entry.neighborhood.name}
            </td>
            {entry.distanceKm != null && <td>{entry.distanceKm.toFixed(1)} km</td>}
            <td>{entry.score.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
