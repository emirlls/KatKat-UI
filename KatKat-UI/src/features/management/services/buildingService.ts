import { api } from '../../../services/api';
import type { BuildingDto, CreateBuildingDto, UpdateBuildingDto } from '../../../types/building';

export const buildingService = {
  listByComplex: (complexId: string) => api.get<BuildingDto[]>('/buildings', { complexId }),
  get: (id: string) => api.get<BuildingDto>(`/buildings/${id}`),
  create: (input: CreateBuildingDto) => api.post<BuildingDto>('/buildings', input),
  update: (id: string, input: UpdateBuildingDto) => api.put<BuildingDto>(`/buildings/${id}`, input),
  delete: (id: string) => api.delete<void>(`/buildings/${id}`),
};
