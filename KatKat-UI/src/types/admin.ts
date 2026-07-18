import type { CreateComplexDto } from './complex';
import type { LookupDto } from './common';

export interface CreateManagerDto {
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  /** The site created for this Manager, inside their new Tenant - a Manager never creates their own. */
  site: CreateComplexDto;
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
  isActive: boolean;
  complexId?: string;
  complexName?: string;
  city?: LookupDto;
  district?: LookupDto;
  neighborhood?: LookupDto;
  creationTime: string;
}
