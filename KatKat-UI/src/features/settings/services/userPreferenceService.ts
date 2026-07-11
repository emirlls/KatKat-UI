import { api } from '../../../services/api';
import type { SetUserPreferenceDto, UserPreferenceDto } from '../../../types/userPreference';

export const userPreferenceService = {
  getMine: () => api.get<UserPreferenceDto>('/my-preference'),
  setMine: (input: SetUserPreferenceDto) => api.put<UserPreferenceDto>('/my-preference', input),
};
