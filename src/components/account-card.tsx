import { ArrowUpIcon, SearchIcon } from 'lucide-react';
import { Card } from './ui/card';
import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Account } from '@/db/interfaces';

interface AccountCardProps {
  mainAccount: Account;
  otherAccounts?: Account[];
}

const AccountCard = ({ mainAccount, otherAccounts = [] }: AccountCardProps) => {
  // Get all transactions for calculations
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const userSettings = useLiveQuery(() =>
    db.settings.toArray().then((settings) => settings[0])
  );

  const monthlyChanges = useMemo(() => {
    const calculateMonthlyChange = (accountId: number) => {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const currentMonthTransactions = transactions.filter(
        (t) =>
          t.accountId === accountId &&
          new Date(t.date) >= currentMonthStart &&
          new Date(t.date) <= currentMonthEnd
      );

      const lastMonthTransactions = transactions.filter(
        (t) =>
          t.accountId === accountId &&
          new Date(t.date) >= lastMonthStart &&
          new Date(t.date) <= lastMonthEnd
      );

      const currentMonthNet = currentMonthTransactions.reduce(
        (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
        0
      );

      const lastMonthNet = lastMonthTransactions.reduce(
        (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
        0
      );

      return currentMonthNet - lastMonthNet;
    };

    return {
      main: calculateMonthlyChange(mainAccount.id!),
      others: otherAccounts.map((account) => ({
        id: account.id!,
        change: calculateMonthlyChange(account.id!),
      })),
    };
  }, [transactions, mainAccount.id, otherAccounts]);

  if (!userSettings) {
    return <div>Loading...</div>;
  }

  const currency = userSettings.currency;

  return (
    <div className="relative">
      <Card className="relative  overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white p-6 rounded-xl shadow-lg ">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-white pattern-dots pattern-opacity-10 pattern-size-2 pattern-spacing-6" />
        <div className="relative z-10 space-y-6">
          {/* Main Account Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium text-blue-100">
                  {mainAccount.name}
                </h2>
              </div>
              <button
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5 text-blue-100" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-4xl font-bold tracking-tight">
                {currency}
                {mainAccount.balance.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <span className="text-sm">This month</span>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full text-sm">
                  <span>
                    {monthlyChanges.main >= 0 ? '+' : '-'}
                    {currency}
                    {Math.abs(monthlyChanges.main).toLocaleString()}
                  </span>
                  <ArrowUpIcon
                    className={`h-3 w-3 ${
                      monthlyChanges.main < 0 ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Other Accounts Section */}
          {otherAccounts.length > 0 && (
            <div className="pt-4 border-t border-white/20">
              <h3 className="text-sm font-medium text-blue-100 mb-3">
                Other Accounts
              </h3>
              <div className="space-y-3">
                {otherAccounts.map((account) => {
                  const monthlyChange =
                    monthlyChanges.others.find((o) => o.id === account.id)
                      ?.change || 0;
                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
                    >
                      <span className="text-sm font-medium">
                        {account.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {currency}
                          {account.balance.toLocaleString()}
                        </span>
                        <div className="flex items-center text-xs text-blue-100">
                          <span>
                            {monthlyChange >= 0 ? '+' : '-'}
                            {currency}
                            {Math.abs(monthlyChange).toLocaleString()}
                          </span>
                          <ArrowUpIcon
                            className={`h-3 w-3 ml-1 ${
                              monthlyChange < 0 ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AccountCard;
