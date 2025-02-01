import { Transaction } from '@/db/interfaces';
import { format } from 'date-fns';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  MoreHorizontal,
  Receipt,
  Tag,
  Wallet,
} from 'lucide-react';
import { Account } from '@/types/account';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface TransactionListItemProps {
  transaction: Transaction;
  accounts: Account[];
  categories: any[];
}

const TransactionListItem = ({
  transaction,
  accounts,
  categories,
}: TransactionListItemProps) => {
  const isIncome = transaction.type === 'income';
  const account = accounts.find((a) => a.id === transaction.accountId);
  const category = categories.find((c) => c.id === transaction.category);

  return (
    <div className="group relative flex items-center gap-3 p-3 hover:bg-muted/50 transition-all">
      {/* Transaction Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors',
          isIncome
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        )}
      >
        {isIncome ? (
          <ArrowUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <ArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </div>

      {/* Transaction Details */}
      <div className="flex-grow min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm sm:text-base text-foreground truncate">
            {transaction.description || category?.name || 'Uncategorized'}
          </span>
          {transaction.note && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent>{transaction.note}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1 min-w-0">
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">
              {account?.name || 'Unknown Account'}
            </span>
          </div>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-1 min-w-0">
            <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="truncate">
              {category?.name || 'Uncategorized'}
            </span>
          </div>
        </div>
      </div>

      {/* Amount and Actions */}
      <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
        <span
          className={cn(
            'font-semibold text-sm sm:text-base tabular-nums',
            isIncome
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
        </span>

        {/* Quick Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Transaction</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 dark:text-red-400">
              Delete Transaction
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TransactionListItem;
