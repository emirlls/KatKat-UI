import { api } from '../../../services/api';
import type { RegisterDto } from '../../../types/auth';

export const accountService = {
  register: (input: RegisterDto) => api.post<void>('/account/register', input),
};
