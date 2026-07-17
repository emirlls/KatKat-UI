import { useEffect, useState } from 'react';
import { Select } from '../../../components/Select';
import { useAsync } from '../../../hooks/useAsync';
import { locationService } from '../../management/services/locationService';
import type { DistrictDto, NeighborhoodDto } from '../../../types/location';

export interface LocationFilterValue {
  cityId: number | null;
  districtId: number | null;
  neighborhoodId: number | null;
}

interface LocationFilterProps {
  value: LocationFilterValue;
  onChange: (value: LocationFilterValue) => void;
}

/**
 * Independent, all-optional City/District/Neighborhood filter (each level offers "Tümü" - unlike
 * NeighborhoodPicker, which requires drilling all the way down to a single neighborhood).
 */
export function LocationFilter({ value, onChange }: LocationFilterProps) {
  const [districts, setDistricts] = useState<DistrictDto[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodDto[]>([]);

  const { data: cities } = useAsync(() => locationService.getCities(), []);

  useEffect(() => {
    if (value.cityId === null) {
      setDistricts([]);
      return;
    }
    // Ignore this fetch's result if the user has already moved on to a different city by the
    // time it resolves - otherwise a slow response for an earlier selection can land after a
    // faster one and clobber the correct list with stale data.
    let stale = false;
    locationService
      .getDistrictsByCity(value.cityId)
      .then((result) => {
        if (!stale) setDistricts(result);
      })
      .catch(() => {
        if (!stale) setDistricts([]);
      });
    return () => {
      stale = true;
    };
  }, [value.cityId]);

  useEffect(() => {
    if (value.districtId === null) {
      setNeighborhoods([]);
      return;
    }
    let stale = false;
    locationService
      .getNeighborhoodsByDistrict(value.districtId)
      .then((result) => {
        if (!stale) setNeighborhoods(result);
      })
      .catch(() => {
        if (!stale) setNeighborhoods([]);
      });
    return () => {
      stale = true;
    };
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
