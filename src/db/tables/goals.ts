export interface GoalsTable {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category: string;
  priority: string;
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
