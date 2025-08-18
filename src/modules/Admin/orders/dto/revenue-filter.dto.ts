export class RevenueFilterDto {
  from?: string;
  to?: string;
  filter?: 'monthly' | 'yearly' | 'quarterly';
}
