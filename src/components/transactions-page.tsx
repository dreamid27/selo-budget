import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

import { DateRangePicker } from './ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Search, Filter } from 'lucide-react';
import TransactionListItem from './transaction-list-item';
import Navbar from './navbar';
import { Transaction } from '@/types/transaction';
import { motion, AnimatePresence } from 'framer-motion';

interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

const TransactionsPage = () => {
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedType, setSelectedType] = useState<string>('all');

  // Fetch data from database
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const accounts = useLiveQuery(() => db.accounts.toArray()) || [];
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  // Filter transactions based on all criteria
  const filteredTransactions = transactions.filter((transaction) => {
    // Search query filter
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' ||
      (transaction.category !== undefined &&
        transaction.category === parseInt(selectedCategory));

    // Account filter
    const matchesAccount =
      selectedAccount === 'all' ||
      (transaction.accountId !== undefined &&
        transaction.accountId === parseInt(selectedAccount));

    // Date range filter
    const matchesDateRange =
      !dateRange?.from ||
      !dateRange?.to ||
      (new Date(transaction.date) >= dateRange.from &&
        new Date(transaction.date) <= dateRange.to);

    // Transaction type filter
    const matchesType =
      selectedType === 'all' || transaction.type === selectedType;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAccount &&
      matchesDateRange &&
      matchesType
    );
  });

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce<TransactionGroup[]>(
    (groups, transaction) => {
      const date = format(new Date(transaction.date), 'MMMM d, yyyy');
      const existingGroup = groups.find((group) => group.date === date);

      if (existingGroup) {
        existingGroup.transactions.push(transaction);
      } else {
        groups.push({ date, transactions: [transaction] });
      }

      // Sort transactions within each group by date (newest first)
      groups.forEach((group) => {
        group.transactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

      return groups;
    },
    []
  );

  // Sort groups by date (newest first)
  groupedTransactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">Transactions</h1>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(
                    (category) =>
                      category.id !== undefined && (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>

              {/* Account Filter */}
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map(
                    (account) =>
                      account.id !== undefined && (
                        <SelectItem
                          key={account.id}
                          value={account.id.toString()}
                        >
                          {account.name}
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>

              {/* Date Range Picker */}
              <DateRangePicker value={dateRange} onChange={setDateRange} />

              {/* Transaction Type Filter */}
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Transactions List */}
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {groupedTransactions.map((group, groupIndex) => (
                  <motion.div
                    key={group.date}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: groupIndex * 0.05 }}
                  >
                    <div className="bg-card">
                      <div className="sticky top-0 z-10 backdrop-blur-xl bg-background/80 border-b px-4 py-3">
                        <div className="flex items-baseline justify-between">
                          <h2 className="text-base sm:text-lg font-semibold">
                            {group.date}
                          </h2>
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            {group.transactions.length} transaction
                            {group.transactions.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <div className="divide-y divide-border/50">
                        {group.transactions.map((transaction, index) => (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.03 }}
                          >
                            <TransactionListItem
                              transaction={transaction}
                              accounts={accounts}
                              categories={categories}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {filteredTransactions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-12"
                >
                  <div className="text-center max-w-sm mx-auto">
                    <div className="relative mx-auto w-16 h-16 sm:w-24 sm:h-24 mb-6">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                      <div className="relative bg-background rounded-full p-4 sm:p-6 border">
                        <Filter className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                      No transactions found
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      Try adjusting your filters or search query to find what
                      you're looking for.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;
