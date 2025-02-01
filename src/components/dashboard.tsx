import { ThemeToggle } from './theme-toggle';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import AccountCard from './account-card';
import TransactionList from './transaction-list';
import TrendCard from './trend-card';
import SpendingByCategory from './spending-by-category';

const Dashboard = () => {
  // Use Dexie's useLiveQuery hook to get real-time updates
  const transactions = useLiveQuery(() => db.transactions.toArray()) || [];
  const accounts = useLiveQuery(() => db.accounts.toArray()) || [];

  const userSettings = useLiveQuery(() =>
    db.settings.toArray().then((settings) => settings[0])
  );
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  if (!userSettings) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold dark:text-white">
              Welcome back, {userSettings.name}
            </h1>
            <ThemeToggle />
          </div>
          <p className="text-muted-foreground dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.length > 0 && (
            <AccountCard
              mainAccount={accounts[0]}
              otherAccounts={accounts.slice(1)}
            />
          )}
          <SpendingByCategory transactions={transactions} />
        </div>

        {/* Trends Section */}
        <TrendCard transactions={transactions} />

        {/* Accounts Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TransactionList
            accounts={accounts}
            categories={categories}
            transactions={transactions}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
