import { useEffect, useState } from 'react';
import { Select } from '../../../components/Select';
import type { DistrictDto, NeighborhoodDto } from '../../../types/location';
import { locationService } from '../services/locationService';
import { useAsync } from '../../../hooks/useAsync';

interface NeighborhoodPickerProps {
  neighborhoodId: number | null;
  onChange: (neighborhoodId: number | null) => void;
}

export function NeighborhoodPicker({ neighborhoodId, onChange }: NeighborhoodPickerProps) {
  const [cityId, setCityId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodDto[]>([]);

  const { data: cities } = useAsync(() => locationService.getCities(), []);

  useEffect(() => {
    if (cityId === null) {
      setDistricts([]);
      return;
    }
    locationService.getDistrictsByCity(cityId).then(setDistricts).catch(() => setDistricts([]));
  }, [cityId]);

  useEffect(() => {
    if (districtId === null) {
      setNeighborhoods([]);
      return;
    }
    locationService.getNeighborhoodsByDistrict(districtId).then(setNeighborhoods).catch(() => setNeighborhoods([]));
  }, [districtId]);

  return (
    <div className="row">
      <Select
        label="İl"
        value={cityId ?? ''}
        onChange={(e) => {
          setCityId(e.target.value ? Number(e.target.value) : null);
          setDistrictId(null);
          onChange(null);
        }}
      >
        <option value="">Seçiniz</option>
        {cities?.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </Select>
      <Select
        label="İlçe"
        value={districtId ?? ''}
        disabled={!cityId}
        onChange={(e) => {
          setDistrictId(e.target.value ? Number(e.target.value) : null);
          onChange(null);
        }}
      >
        <option value="">Seçiniz</option>
        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.name}
          </option>
        ))}
      </Select>
      <Select
        label="Mahalle"
        value={neighborhoodId ?? ''}
        disabled={!districtId}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">Seçiniz</option>
        {neighborhoods.map((neighborhood) => (
          <option key={neighborhood.id} value={neighborhood.id}>
            {neighborhood.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
