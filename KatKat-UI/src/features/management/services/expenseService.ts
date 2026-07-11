import { api } from '../../../services/api';
import type { CreateExpenseDto, ExpenseDto, ExpenseShareDto } from '../../../types/expense';

export const expenseService = {
  listByComplex: (complexId: string) => api.get<ExpenseDto[]>('/expenses', { complexId }),
  create: (input: CreateExpenseDto) => api.post<ExpenseDto>('/expenses', input),
  getSharesByExpense: (expenseId: string) => api.get<ExpenseShareDto[]>(`/expenses/${expenseId}/shares`),
  getSharesByFlat: (flatId: string) => api.get<ExpenseShareDto[]>(`/expenses/shares/by-flat/${flatId}`),
  payShare: (shareId: string) => api.post<ExpenseShareDto>(`/expenses/shares/${shareId}/pay`),
};
