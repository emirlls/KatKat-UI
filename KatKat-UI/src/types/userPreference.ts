import type { EntityDto } from './common';

export interface UserPreferenceDto extends EntityDto<string> {
  userId: string;
  receiveNeighborRequestNotifications: boolean;
}

export interface SetUserPreferenceDto {
  receiveNeighborRequestNotifications: boolean;
}
