import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Transaction } from '@/types/transaction';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface SpendingByCategoryProps {
  transactions: Transaction[];
}

type TimeRange =
  | 'this-month'
  | 'last-month'
  | 'last-3-months'
  | 'last-6-months';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FDB462',
  '#B3DE69',
  '#BC80BD',
  '#FB8072',
];

const SpendingByCategory = ({ transactions }: SpendingByCategoryProps) => {
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>('this-month');

  const categorySpending = useMemo(() => {
    const now = new Date();
    let startDate = startOfMonth(now);
    let endDate = endOfMonth(now);

    // Adjust date range based on selection
    switch (selectedTimeRange) {
      case 'last-month':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'last-3-months':
        startDate = startOfMonth(subMonths(now, 3));
        endDate = endOfMonth(now);
        break;
      case 'last-6-months':
        startDate = startOfMonth(subMonths(now, 6));
        endDate = endOfMonth(now);
        break;
    }

    // Filter transactions by date range and type (expenses only)
    const filteredTransactions = transactions.filter(
      (t) => t.type === 'expense' && t.date >= startDate && t.date <= endDate
    );

    // Calculate spending by category
    const spending = filteredTransactions.reduce((acc, transaction) => {
      const categoryName = transaction.categoryName;
      if (!acc[categoryName]) {
        acc[categoryName] = {
          total: 0,
          transactions: [],
        };
      }
      acc[categoryName].total += transaction.amount;
      acc[categoryName].transactions.push(transaction);
      return acc;
    }, {} as Record<string, { total: number; transactions: Transaction[] }>);

    // Convert to array and sort by total
    const spendingArray = Object.entries(spending).map(
      ([categoryName, data]) => ({
        categoryName,
        ...data,
      })
    );

    spendingArray.sort((a, b) => b.total - a.total);

    // Calculate percentages
    const totalSpending = spendingArray.reduce(
      (sum, item) => sum + item.total,
      0
    );
    return {
      categories: spendingArray.map((item) => ({
        ...item,
        percentage: (item.total / totalSpending) * 100,
      })),
      totalSpending,
    };
  }, [transactions, selectedTimeRange]);

  return (
    <Card className="w-full transition-all duration-200 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8 pt-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Spending by Category
        </CardTitle>
        <Select
          value={selectedTimeRange}
          onValueChange={(value: TimeRange) => setSelectedTimeRange(value)}
        >
          <SelectTrigger className="w-[180px] transition-colors hover:border-primary">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              value="this-month"
              className="cursor-pointer hover:bg-primary/10"
            >
              This Month
            </SelectItem>
            <SelectItem
              value="last-month"
              className="cursor-pointer hover:bg-primary/10"
            >
              Last Month
            </SelectItem>
            <SelectItem
              value="last-3-months"
              className="cursor-pointer hover:bg-primary/10"
            >
              Last 3 Months
            </SelectItem>
            <SelectItem
              value="last-6-months"
              className="cursor-pointer hover:bg-primary/10"
            >
              Last 6 Months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center p-6 bg-primary/5 rounded-lg transition-transform hover:scale-[1.02] duration-200">
          <p className="text-sm text-muted-foreground font-medium mb-2">
            Total Spending
          </p>
          <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            $
            {categorySpending.totalSpending.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="h-[300px] w-full mb-8 transition-transform hover:scale-[1.02] duration-200">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categorySpending.categories}
                dataKey="total"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                animationDuration={750}
                animationBegin={0}
              >
                {categorySpending.categories.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `$${value.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                }
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  border: 'none',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          {categorySpending.categories.map((category, index) => (
            <div
              key={category.categoryName}
              className="space-y-2 p-3 rounded-lg transition-all duration-200 hover:bg-primary/5"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full transition-transform duration-200 hover:scale-110"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <h3 className="font-semibold text-base">
                      {category.categoryName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.transactions.length} transaction
                      {category.transactions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-base">
                    $
                    {category.total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
              <Progress
                value={category.percentage}
                className={cn(
                  'h-2.5 transition-all duration-300 hover:h-3',
                  `[&>div]:bg-[${COLORS[index % COLORS.length]}]`
                )}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingByCategory;
