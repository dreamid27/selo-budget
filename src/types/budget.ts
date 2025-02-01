export type BudgetPeriod = 'monthly' | 'yearly';
export type GoalCategory = 'savings' | 'debt' | 'investment' | 'custom';
export type GoalPriority = 'low' | 'medium' | 'high';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  categoryId: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  isRecurring: boolean;
  notifications: {
    enabled: boolean;
    threshold: number;
  };
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category: GoalCategory;
  priority: GoalPriority;
  notes?: string;
  milestones: {
    id: string;
    amount: number;
    date: Date;
    achieved: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
