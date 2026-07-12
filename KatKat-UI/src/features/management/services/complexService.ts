import { api } from '../../../services/api';
import type { ComplexDto, CreateComplexDto, ExtendComplexSubscriptionDto, UpdateComplexDto } from '../../../types/complex';

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
  create: (input: CreateComplexDto) => api.post<ComplexDto>('/complexes', input),
  update: (id: string, input: UpdateComplexDto) => api.put<ComplexDto>(`/complexes/${id}`, input),
  delete: (id: string) => api.delete<void>(`/complexes/${id}`),
  extendSubscription: (id: string, input: ExtendComplexSubscriptionDto) =>
    api.post<ComplexDto>(`/complexes/${id}/extend-subscription`, input),
  recalculateScores: () => api.post<void>('/complexes/recalculate-scores'),
};
