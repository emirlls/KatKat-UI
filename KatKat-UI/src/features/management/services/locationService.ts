import { api } from '../../../services/api';
import type { CityDto, DistrictDto, NeighborhoodDto } from '../../../types/location';

export const locationService = {
  getCities: () => api.get<CityDto[]>('/cities'),
  getDistrictsByCity: (cityId: number) => api.get<DistrictDto[]>('/districts', { cityId }),
  getNeighborhoodsByDistrict: (districtId: number) => api.get<NeighborhoodDto[]>('/neighborhoods', { districtId }),
};
