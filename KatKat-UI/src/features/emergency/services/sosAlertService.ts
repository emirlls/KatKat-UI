import { api } from '../../../services/api';
import type { ReportSosAlertDto, SosAlertDto } from '../../../types/sosAlert';

export const sosAlertService = {
  getActiveByComplex: (complexId: string) => api.get<SosAlertDto[]>('/sos-alerts', { complexId }),
  report: (input: ReportSosAlertDto) => api.post<SosAlertDto>('/sos-alerts', input),
  resolve: (id: string) => api.post<SosAlertDto>(`/sos-alerts/${id}/resolve`),
};
