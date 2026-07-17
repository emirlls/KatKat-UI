import { api } from '../../../services/api';
import type {
  AdminComplexListItemDto,
  AdminSiteDetailDto,
  ComplexDto,
  ExtendComplexSubscriptionDto,
  UpdateComplexDto,
} from '../../../types/complex';

export interface SearchComplexParams {
  cityId?: number;
  districtId?: number;
  neighborhoodId?: number;
  name?: string;
  maxResultCount?: number;
  [key: string]: unknown;
}

export const complexService = {
  get: (id: string) => api.get<ComplexDto>(`/complexes/${id}`),
  getMy: () => api.get<ComplexDto | null>('/complexes/my'),
  search: (params: SearchComplexParams) => api.get<ComplexDto[]>('/complexes', params),
  searchAcrossAllTenants: (params: SearchComplexParams) =>
    api.get<AdminComplexListItemDto[]>('/complexes/admin/all', params),
  update: (id: string, input: UpdateComplexDto) => api.put<ComplexDto>(`/complexes/${id}`, input),
  delete: (id: string) => api.delete<void>(`/complexes/${id}`),
  updateAcrossAllTenants: (id: string, input: UpdateComplexDto) =>
    api.put<ComplexDto>(`/complexes/admin/${id}`, input),
  deleteAcrossAllTenants: (id: string) => api.delete<void>(`/complexes/admin/${id}`),
  setActiveAcrossAllTenants: (id: string, isActive: boolean) =>
    api.put<ComplexDto>(`/complexes/admin/${id}/active`, undefined, { isActive }),
  getDetailAcrossAllTenants: (id: string) => api.get<AdminSiteDetailDto>(`/complexes/admin/${id}/detail`),
  extendSubscription: (id: string, input: ExtendComplexSubscriptionDto) =>
    api.post<ComplexDto>(`/complexes/${id}/extend-subscription`, input),
  recalculateScores: () => api.post<void>('/complexes/recalculate-scores'),
};
