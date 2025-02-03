import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '@/types/transaction';

interface TrendCardProps {
  transactions: Transaction[];
}

const TrendCard = ({ transactions }: TrendCardProps) => {
  const trends = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get current month transactions
    const currentMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    // Get last month transactions
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const lastMonthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === lastMonth &&
        transactionDate.getFullYear() === lastMonthYear
      );
    });

    // Calculate current month totals
    const currentIncome = currentMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentExpenses = currentMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate last month totals
    const lastIncome = lastMonthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const lastExpenses = lastMonthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate percentage changes
    const incomeChange =
      lastIncome === 0
        ? 100
        : ((currentIncome - lastIncome) / lastIncome) * 100;
    const expenseChange =
      lastExpenses === 0
        ? 100
        : ((currentExpenses - lastExpenses) / lastExpenses) * 100;

    return {
      currentIncome,
      currentExpenses,
      incomeChange,
      expenseChange,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Income Trend Card */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Income Trend</h3>
          <div
            className={`p-2 rounded-full ${
              trends.incomeChange >= 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {trends.incomeChange >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
          </div>
        </div>
        <p className="text-3xl font-bold mb-2">
          {trends.currentIncome.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {Math.abs(trends.incomeChange).toFixed(1)}%{' '}
          {trends.incomeChange >= 0 ? 'increase' : 'decrease'} from last month
        </p>
      </Card>

      {/* Expense Trend Card */}
      <Card className="p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Expense Trend</h3>
          <div
            className={`p-2 rounded-full ${
              trends.expenseChange <= 0
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}
          >
            {trends.expenseChange <= 0 ? (
              <TrendingDown className="h-5 w-5" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )}
          </div>
        </div>
        <p className="text-3xl font-bold mb-2">
          {trends.currentExpenses.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {Math.abs(trends.expenseChange).toFixed(1)}%{' '}
          {trends.expenseChange >= 0 ? 'increase' : 'decrease'} from last month
        </p>
      </Card>
    </div>
  );
};

export default TrendCard;
