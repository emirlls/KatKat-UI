import { api } from '../../../services/api';
import type {
  CreateFlatDto,
  FlatDto,
  FlatMemberDto,
  InviteFlatMemberDto,
  UpdateFlatDto,
  UpdateResidentInfoDto,
} from '../../../types/building';

export const flatService = {
  listByBuilding: (buildingId: string) => api.get<FlatDto[]>('/flats', { buildingId }),
  getMyFlats: (complexId: string) => api.get<FlatDto[]>('/flats/my', { complexId }),
  create: (input: CreateFlatDto) => api.post<FlatDto>('/flats', input),
  update: (id: string, input: UpdateFlatDto) => api.put<FlatDto>(`/flats/${id}`, input),
  delete: (id: string) => api.delete<void>(`/flats/${id}`),
  listMembersByFlat: (flatId: string) => api.get<FlatMemberDto[]>('/flat-members', { flatId }),
  invite: (input: InviteFlatMemberDto) => api.post<FlatMemberDto>('/flat-members/invite', input),
  approve: (id: string) => api.post<FlatMemberDto>(`/flat-members/${id}/approve`),
  promoteToManager: (id: string) => api.post<FlatMemberDto>(`/flat-members/${id}/promote-to-manager`),
  removeMember: (id: string) => api.delete<void>(`/flat-members/${id}`),
  getResidentInfo: (id: string) => api.get<UpdateResidentInfoDto>(`/flat-members/${id}/resident-info`),
  updateResidentInfo: (id: string, input: UpdateResidentInfoDto) =>
    api.put<FlatMemberDto>(`/flat-members/${id}/resident-info`, input),
};
