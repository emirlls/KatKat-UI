export interface LookupDto {
  id: number;
  name: string;
}

export interface FullAuditedEntityDto<TKey> {
  id: TKey;
  creationTime: string;
  creatorId?: string;
  lastModificationTime?: string;
  lastModifierId?: string;
  isDeleted: boolean;
  deletionTime?: string;
  deleterId?: string;
}

export interface EntityDto<TKey> {
  id: TKey;
}
