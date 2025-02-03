import { useState } from 'react';
import { Transaction } from '../types/transaction';
import { Account } from '@/types/account';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowDownCircle, ArrowUpCircle, WalletIcon } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import CategorySelector from './category-selector';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  transactionSchema,
  TransactionFormValues,
} from '@/schemas/transaction';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

const TransactionForm = ({
  onSubmit,
  categories,
  accounts,
  onOpenChange,
}: {
  onSubmit: (data: Omit<Transaction, 'id'>) => Promise<void>;
  categories: any[];
  accounts: Account[];
  onOpenChange: (open: boolean) => void;
}) => {
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: 0,
      accountId: 0,
      description: '',
      note: '',
      date: new Date(),
    },
  });

  const handleSubmit = async (data: TransactionFormValues) => {
    const selectedCategory = categories.find((cat) => cat.id === data.category);

    await onSubmit({
      ...data,
      amount: parseFloat(data.amount),
      categoryName: selectedCategory?.name || '',
    });
    onOpenChange(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs
          defaultValue={type}
          onValueChange={(v) => {
            setType(v as 'expense' | 'income');
            form.setValue('type', v as 'expense' | 'income');
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="expense"
              className={`data-[state=active]:bg-red-100 py-2 transition-colors ${
                type === 'expense' ? 'text-red-600' : ''
              }`}
            >
              <ArrowDownCircle className="h-4 w-4 mr-2" />
              Expense
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className={`data-[state=active]:bg-green-100 py-2 transition-colors ${
                type === 'income' ? 'text-green-600' : ''
              }`}
            >
              <ArrowUpCircle className="h-4 w-4 mr-2" />
              Income
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="What was this transaction for?"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Amount</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="h-12 text-2xl font-medium"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategorySelector
                  categories={categories}
                  selectedCategory={field.value}
                  type={type}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountId"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Account</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts.map((account) => (
                  <Button
                    key={account.id}
                    type="button"
                    variant={field.value === account.id ? 'default' : 'outline'}
                    className={`justify-start h-11 hover:scale-102 transition-all ${
                      field.value === account.id
                        ? 'bg-blue-50 hover:bg-blue-50/90 text-blue-600'
                        : ''
                    }`}
                    onClick={() => field.onChange(account.id)}
                  >
                    <WalletIcon className="h-4 w-4 mr-2 shrink-0" />
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm font-medium truncate">
                        {account.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {account.balance.toFixed(2)}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Date</FormLabel>
              <FormControl>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date: Date | undefined) => {
                      if (date) {
                        field.onChange(date);
                        form.setValue('date', date);
                      }
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    className="w-full"
                    initialFocus
                  />
                </div>
              </FormControl>
              <div className="text-sm text-muted-foreground">
                Selected:{' '}
                {field.value ? format(field.value, 'PPP') : 'No date selected'}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Note (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Add a note" className="h-11" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-11 mt-4">
          Save Transaction
        </Button>
      </form>
    </Form>
  );
};

export default TransactionForm;
