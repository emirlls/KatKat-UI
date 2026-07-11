import type { FullAuditedEntityDto, LookupDto } from './common';

export interface CityDto extends FullAuditedEntityDto<number> {
  name: string;
}

export interface CreateCityDto {
  name: string;
}

export interface UpdateCityDto {
  name: string;
}

export interface DistrictDto extends FullAuditedEntityDto<number> {
  city: LookupDto;
  name: string;
}

export interface CreateDistrictDto {
  cityId: number;
  name: string;
}

export interface UpdateDistrictDto {
  cityId: number;
  name: string;
}

export interface NeighborhoodDto extends FullAuditedEntityDto<number> {
  district: LookupDto;
  name: string;
}

export interface CreateNeighborhoodDto {
  districtId: number;
  name: string;
}

export interface UpdateNeighborhoodDto {
  districtId: number;
  name: string;
}
