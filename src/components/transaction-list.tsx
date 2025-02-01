import { Transaction } from '@/db/interfaces';
import { Card } from './ui/card';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { ArrowRightIcon, PlusIcon, ReceiptIcon } from 'lucide-react';
import TransactionForm from './transaction-form';
import TransactionListItem from './transaction-list-item';
import { Account } from '@/types/account';
import { addTransaction, db, updateAccount } from '@/db/db';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';

const QuickTransactionButton = ({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) => {
  return (
    <Button
      className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all hover:scale-102"
      onClick={() => onOpenChange(true)}
    >
      <PlusIcon className="h-6 w-6" />
    </Button>
  );
};

const TransactionDialog = ({
  onSubmit,
  categories,
  accounts,
}: {
  onSubmit: (data: Omit<Transaction, 'id'>) => Promise<void>;
  categories: any[];
  accounts: Account[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 h-9">
            <PlusIcon className="h-4 w-4" />
            Add Transaction
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[480px] p-4 sm:p-6">
          <DialogHeader className="space-y-2 mb-4">
            <DialogTitle className="text-xl">Add New Transaction</DialogTitle>
            <DialogDescription>
              Record a new expense or income
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={onSubmit}
            categories={categories}
            accounts={accounts}
            onOpenChange={setOpen}
          />
        </DialogContent>
      </Dialog>
      <QuickTransactionButton onOpenChange={setOpen} />
    </>
  );
};

const TransactionList = ({
  accounts,
  categories,
  transactions,
}: {
  accounts: Account[];
  categories: any[];
  transactions: Transaction[];
}) => {
  const userSettings = useLiveQuery(() =>
    db.settings.toArray().then((settings) => settings[0])
  );
  const handleAddTransaction = async (data: Omit<Transaction, 'id'>) => {
    try {
      if (!data.accountId) {
        toast.error('Account is required');
        return;
      }

      const account = accounts.find((a) => a.id === data.accountId);
      if (!account) {
        toast.error('Account not found');
        return;
      }

      const category = categories.find((c) => c.id === data.category);
      if (!category) {
        toast.error('Category not found');
        return;
      }

      // Add transaction to database first
      const newTransaction = await addTransaction({
        ...data,
        categoryName: category.name,
        date: data.date || new Date().toISOString(),
      });

      // Calculate and update account balance
      const balanceChange = data.type === 'income' ? data.amount : -data.amount;
      const newBalance = account.balance + balanceChange;

      await updateAccount(account.id!, newBalance);

      toast.success('Transaction added successfully');
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      throw error; // Re-throw to handle in parent component if needed
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <TransactionDialog
          onSubmit={handleAddTransaction}
          categories={categories}
          accounts={accounts}
        />
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ReceiptIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No transactions yet</p>
            <p className="text-sm">Start by adding your first transaction</p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {transactions
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .slice(0, 5)
                .map((transaction) => (
                  <TransactionListItem
                    key={transaction.id}
                    transaction={transaction}
                    accounts={accounts}
                    categories={categories}
                  />
                ))}
            </div>
            {transactions.length > 5 && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  /* Implement view all transactions */
                }}
              >
                View All Transactions
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default TransactionList;
