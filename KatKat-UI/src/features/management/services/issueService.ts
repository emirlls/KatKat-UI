import { api } from '../../../services/api';
import type { IssueStatus } from '../../../types/enums';
import type { CreateIssueDto, IssueDto } from '../../../types/issue';

export const issueService = {
  listByComplex: (complexId: string, status?: IssueStatus) => api.get<IssueDto[]>('/issues', { complexId, status }),
  create: (input: CreateIssueDto) => api.post<IssueDto>('/issues', input),
  startProgress: (id: string) => api.post<IssueDto>(`/issues/${id}/start-progress`),
  resolve: (id: string) => api.post<IssueDto>(`/issues/${id}/resolve`),
};
