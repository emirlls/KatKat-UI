import { api } from '../../../services/api';
import type { BuildingDto, CreateBuildingDto } from '../../../types/building';

export const buildingService = {
  listByComplex: (complexId: string) => api.get<BuildingDto[]>('/buildings', { complexId }),
  get: (id: string) => api.get<BuildingDto>(`/buildings/${id}`),
  create: (input: CreateBuildingDto) => api.post<BuildingDto>('/buildings', input),
};
