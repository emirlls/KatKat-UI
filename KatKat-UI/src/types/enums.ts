export type ExpenseDistributionMode = 0 | 1;
export const ExpenseDistributionModeLabels: Record<ExpenseDistributionMode, string> = {
  0: 'Arsa Payına Göre',
  1: 'Eşit Paylaşım',
};

export type IssueStatus = 0 | 1 | 2;
export const IssueStatusLabels: Record<IssueStatus, string> = {
  0: 'Açık',
  1: 'İşlemde',
  2: 'Çözüldü',
};

export type SosStatus = 0 | 1;
export const SosStatusLabels: Record<SosStatus, string> = {
  0: 'Güvendeyim',
  1: 'Yardım Lazım',
};

export type FlatMemberRole = 0 | 1 | 2 | 3;
export const FlatMemberRoleLabels: Record<FlatMemberRole, string> = {
  0: 'Onay Bekleyen Sakin',
  1: 'Sakin',
  2: 'Yönetici',
  3: 'Malik',
};

export type ReservationStatus = 0 | 1;
export const ReservationStatusLabels: Record<ReservationStatus, string> = {
  0: 'Onaylı',
  1: 'İptal Edildi',
};

export type ResourceType = 0 | 1;
export const ResourceTypeLabels: Record<ResourceType, string> = {
  0: 'Otopark Alanı',
  1: 'Ortak Alan',
};

export type P2PRequestStatus = 0 | 1 | 2;
export const P2PRequestStatusLabels: Record<P2PRequestStatus, string> = {
  0: 'Açık',
  1: 'Karşılandı',
  2: 'İptal Edildi',
};
