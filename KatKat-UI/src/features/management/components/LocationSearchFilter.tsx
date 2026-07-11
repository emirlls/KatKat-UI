import { useEffect, useState } from 'react';
import { Select } from '../../../components/Select';
import { useAsync } from '../../../hooks/useAsync';
import type { DistrictDto, NeighborhoodDto } from '../../../types/location';
import { locationService } from '../services/locationService';

export interface LocationFilterValue {
  cityId: number | null;
  districtId: number | null;
  neighborhoodId: number | null;
}

interface LocationSearchFilterProps {
  value: LocationFilterValue;
  onChange: (value: LocationFilterValue) => void;
}

/** Unlike NeighborhoodPicker (used for Complex creation), every level here is optional - used to filter a search. */
export function LocationSearchFilter({ value, onChange }: LocationSearchFilterProps) {
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodDto[]>([]);

  const { data: cities } = useAsync(() => locationService.getCities(), []);

  useEffect(() => {
    if (value.cityId === null) {
      setDistricts([]);
      return;
    }
    locationService.getDistrictsByCity(value.cityId).then(setDistricts).catch(() => setDistricts([]));
  }, [value.cityId]);

  useEffect(() => {
    if (value.districtId === null) {
      setNeighborhoods([]);
      return;
    }
    locationService.getNeighborhoodsByDistrict(value.districtId).then(setNeighborhoods).catch(() => setNeighborhoods([]));
  }, [value.districtId]);

  return (
    <div className="row">
      <Select
        label="İl"
        value={value.cityId ?? ''}
        onChange={(e) => onChange({ cityId: e.target.value ? Number(e.target.value) : null, districtId: null, neighborhoodId: null })}
      >
        <option value="">Tümü</option>
        {cities?.map((city) => (
          <option key={city.id} value={city.id}>
            {city.name}
          </option>
        ))}
      </Select>
      <Select
        label="İlçe"
        value={value.districtId ?? ''}
        disabled={!value.cityId}
        onChange={(e) => onChange({ ...value, districtId: e.target.value ? Number(e.target.value) : null, neighborhoodId: null })}
      >
        <option value="">Tümü</option>
        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.name}
          </option>
        ))}
      </Select>
      <Select
        label="Mahalle"
        value={value.neighborhoodId ?? ''}
        disabled={!value.districtId}
        onChange={(e) => onChange({ ...value, neighborhoodId: e.target.value ? Number(e.target.value) : null })}
      >
        <option value="">Tümü</option>
        {neighborhoods.map((neighborhood) => (
          <option key={neighborhood.id} value={neighborhood.id}>
            {neighborhood.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
