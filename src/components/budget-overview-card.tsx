import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  BudgetLimit,
  BudgetProgress,
  Category,
  Transaction,
} from '../db/interfaces';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Plus, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import BudgetSettingsForm from './budget-settings-form';

const BudgetOverviewCard = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const budgetLimits = useLiveQuery(() => db.budgetLimits.toArray()) || [];
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  const calculateProgress = (categoryId: number): BudgetProgress | null => {
    const limit = budgetLimits.find(
      (b: BudgetLimit) => b.categoryId === categoryId
    );
    if (!limit) return null;

    const currentDate = new Date();
    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const spent = transactions
      .filter(
        (t) =>
          t.category === categoryId &&
          t.type === 'expense' &&
          new Date(t.date) >= monthStart
      )
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      categoryId,
      spent,
      limit: limit.amount,
      percentage: (spent / limit.amount) * 100,
      period: limit.period,
    };
  };

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-200 dark:bg-red-950';
    if (percentage >= 80) return 'bg-yellow-200 dark:bg-yellow-950';
    return 'bg-green-200 dark:bg-green-950';
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Budget Overview</h3>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Set Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Budget Settings</DialogTitle>
              </DialogHeader>
              <BudgetSettingsForm
                categories={categories as Category[]}
                budgetLimits={budgetLimits}
                onClose={handleCloseSettings}
              />
            </DialogContent>
          </Dialog>
        </div>

        {budgetLimits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No budget limits set yet.</p>
            <p className="text-sm">
              Click "Set Budget" to start managing your spending limits.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories
              .filter((c) => c.type === 'expense')
              .map((category) => {
                const progress = calculateProgress(Number(category.id));
                if (!progress) return null;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${progress.spent.toFixed(2)} / $
                        {progress.limit.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className={`h-2 rounded-full ${getBudgetStatus(
                          progress.percentage
                        )}`}
                        style={{
                          width: `${Math.min(progress.percentage, 100)}%`,
                        }}
                      />
                    </div>
                    {progress.percentage >= 80 && (
                      <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {progress.percentage >= 100
                          ? 'Over budget!'
                          : 'Approaching budget limit'}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetOverviewCard;
