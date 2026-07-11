import type { FullAuditedEntityDto } from './common';
import type { ExpenseDistributionMode } from './enums';

export interface ExpenseDto extends FullAuditedEntityDto<string> {
  complexId: string;
  title: string;
  description?: string;
  totalAmount: number;
  distributionModes: ExpenseDistributionMode;
  issuedAt: string;
  receiptImageUrl?: string;
}

export interface CreateExpenseDto {
  complexId: string;
  title: string;
  description?: string;
  totalAmount: number;
  distributionModes: ExpenseDistributionMode;
  issuedAt: string;
  receiptImageUrl?: string;
}

export interface ExpenseShareDto extends FullAuditedEntityDto<string> {
  expenseId: string;
  flatId: string;
  flatNumber: string;
  amount: number;
  isPaid: boolean;
  paidAt?: string;
}
