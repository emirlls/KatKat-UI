import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { LeaderboardDto } from '../../../types/complex';

function scoreColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#eab308';
  return '#dc2626';
}

interface SelfComplex {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface NearbyMapProps {
  center: [number, number];
  entries: LeaderboardDto[];
  selfComplex?: SelfComplex | null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [map, center[0], center[1]]);
  return null;
}

export function NearbyMap({ center, entries, selfComplex }: NearbyMapProps) {
  return (
    <MapContainer center={center} zoom={13} style={{ height: 400, width: '100%', borderRadius: 12 }}>
      <RecenterMap center={center} />
      <TileLayer
        attribution="&copy; OpenStreetMap katkıda bulunanlar"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selfComplex && !entries.some((entry) => entry.complexId === selfComplex.id) && (
        <CircleMarker
          center={[selfComplex.latitude, selfComplex.longitude]}
          radius={11}
          pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.9 }}
        >
          <Popup>
            <strong>{selfComplex.name}</strong> (sizin siteniz)
            <br />
            Henüz puanlanmadı
          </Popup>
        </CircleMarker>
      )}
      {entries.map((entry) => {
        const isSelf = entry.complexId === selfComplex?.id;
        return (
          <CircleMarker
            key={entry.complexId}
            center={[entry.latitude, entry.longitude]}
            radius={isSelf ? 11 : 9}
            pathOptions={{
              color: isSelf ? '#2563eb' : scoreColor(entry.score),
              fillColor: scoreColor(entry.score),
              fillOpacity: 0.8,
              weight: isSelf ? 3 : 1,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -8]} className="map-score-badge">
              {entry.score.toFixed(0)}
            </Tooltip>
            <Popup>
              <strong>{entry.complexName}</strong> {isSelf && '(sizin siteniz)'}
              <br />
              Puan: {entry.score.toFixed(1)}
              {entry.distanceKm != null && (
                <>
                  <br />
                  {entry.distanceKm.toFixed(1)} km uzaklıkta
                </>
              )}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
