import type { LookupDto } from './common';

export interface CreateManagerDto {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateManagerDto {
  userName: string;
  email: string;
  phoneNumber: string;
}

export interface ManagerListItemDto {
  id: string;
  tenantId: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  complexId?: string;
  complexName?: string;
  city?: LookupDto;
  district?: LookupDto;
  neighborhood?: LookupDto;
  creationTime: string;
}
