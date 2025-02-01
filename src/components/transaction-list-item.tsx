import { Transaction } from '@/db/interfaces';
import { format } from 'date-fns';
import {
  ArrowDownCircle,
  ArrowDownIcon,
  ArrowUpCircle,
  ArrowUpIcon,
} from 'lucide-react';
import { Account } from '@/types/account';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { motion } from 'framer-motion';

interface TransactionListItemProps {
  transaction: Transaction;
  currency: string;
  accounts: Account[];
  categories: any[];
}

const TransactionListItem = ({
  transaction,
  currency,
  accounts,
  categories,
}: TransactionListItemProps) => {
  const isIncome = transaction.type === 'income';

  console.log(accounts, 'accounts');
  console.log(categories, 'categories');

  // Find the account and category from their respective arrays using the IDs
  const account = accounts.find((a) => a.id === transaction.accountId);
  const category = categories.find((c) => c.id === transaction.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'p-2 rounded-full',
            isIncome
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
          )}
        >
          {isIncome ? (
            <ArrowUpIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <ArrowDownIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {category?.name || 'Uncategorized'}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{account?.name || 'Unknown Account'}</span>
            <span>•</span>
            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <span
        className={cn(
          'font-semibold',
          isIncome
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        )}
      >
        {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
      </span>
    </motion.div>
  );
};

export default TransactionListItem;
