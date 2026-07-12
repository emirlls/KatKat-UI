import { api } from '../../../services/api';
import type { CreateManagerDto } from '../../../types/admin';

export const managerService = {
  create: (input: CreateManagerDto) => api.post<void>('/account/managers', input),
};
