import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Plus,
  Wallet,
  CreditCard,
  PiggyBank,
  Banknote,
  ShoppingCart,
  Home,
  Bus,
  Gamepad2,
  Lightbulb,
  DollarSign,
  Briefcase,
  TrendingUp,
  Plus as PlusIcon,
  type LucideIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { useNavigate } from 'react-router-dom';
import { db, isOnboardingComplete } from '../db/db';

type OnboardingStep = {
  id: number;
  title: string;
  description: string;
};

interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  isCustom?: boolean;
}

interface CategoryWithIcon extends Category {
  icon: LucideIcon;
}

const accountTypeIcons = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  cash: Banknote,
} as const;

const defaultCategories: CategoryWithIcon[] = [
  { id: '1', name: 'Groceries', type: 'expense', icon: ShoppingCart },
  { id: '2', name: 'Rent', type: 'expense', icon: Home },
  { id: '3', name: 'Transportation', type: 'expense', icon: Bus },
  { id: '4', name: 'Entertainment', type: 'expense', icon: Gamepad2 },
  { id: '5', name: 'Utilities', type: 'expense', icon: Lightbulb },
  { id: '6', name: 'Salary', type: 'income', icon: DollarSign },
  { id: '7', name: 'Freelance', type: 'income', icon: Briefcase },
  { id: '8', name: 'Investments', type: 'income', icon: TrendingUp },
];

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome! Let's get started",
    description: 'First, tell us your name',
  },
  {
    id: 2,
    title: 'Setting Account',
    description: 'Add your accounts and their current balances',
  },
  {
    id: 3,
    title: 'Customize Categories',
    description: 'Select categories and add custom ones to track your finances',
  },
];

// Define validation schemas for each step
const stepOneSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const stepTwoSchema = z.object({
  currency: z.string().min(1, 'Please select a currency'),
  accounts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().min(1, 'Account name is required'),
        type: z.enum(['checking', 'savings', 'credit', 'cash']),
        balance: z.string().min(1, 'Balance is required'),
      })
    )
    .min(1, 'At least one account is required'),
});

const stepThreeSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['expense', 'income']),
      icon: z.any(),
      isCustom: z.boolean().optional(),
    })
  ),
  newCategory: z.object({
    name: z.string(),
    type: z.enum(['expense', 'income']),
  }),
});

// Combined schema for all steps
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currency: z.string().min(1, 'Please select a currency'),
  accounts: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, 'Account name is required'),
      type: z.enum(['checking', 'savings', 'credit', 'cash']),
      balance: z.string().min(1, 'Balance is required'),
    })
  ),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['expense', 'income']),
      icon: z.any(),
      isCustom: z.boolean().optional(),
    })
  ),
  newCategory: z.object({
    name: z.string(),
    type: z.enum(['expense', 'income']),
  }),
});

type FormData = z.infer<typeof formSchema>;

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Initialize form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(
      currentStep === 1
        ? stepOneSchema
        : currentStep === 2
        ? stepTwoSchema
        : stepThreeSchema
    ),
    defaultValues: {
      name: '',
      currency: 'USD',
      accounts: [{ id: '1', name: '', type: 'checking', balance: '' }],
      categories: defaultCategories,
      newCategory: {
        name: '',
        type: 'expense',
      },
    },
  });

  // Remove the localStorage effect
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const isComplete = await isOnboardingComplete();
      if (isComplete) {
        navigate('/dashboard');
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const formData = form.getValues();

      try {
        // Save user settings
        await db.settings.add({
          name: formData.name,
          currency: formData.currency,
          theme: 'light', // default theme
        });

        // Save accounts
        const accountsToAdd = formData.accounts.map((account) => ({
          name: account.name,
          type: account.type,
          balance: parseFloat(account.balance),
          currency: formData.currency,
        }));
        await db.accounts.bulkAdd(accountsToAdd);

        // Save categories
        const categoriesToAdd: Omit<Category, 'id'>[] = formData.categories.map(
          (category) => ({
            name: category.name,
            type: category.type,
            icon: category.icon.name, // Store icon name as string
          })
        );
        await db.categories.bulkAdd(categoriesToAdd);

        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAddAccount = () => {
    const accounts = form.getValues('accounts');
    form.setValue('accounts', [
      ...accounts,
      {
        id: crypto.randomUUID(),
        name: '',
        type: 'checking',
        balance: '',
      },
    ]);
  };

  const handleAddCategory = () => {
    const newCategory = form.getValues('newCategory');

    if (!newCategory.name.trim()) {
      return;
    }

    const categories = form.getValues('categories');
    form.setValue('categories', [
      ...categories,
      {
        id: crypto.randomUUID(),
        name: newCategory.name.trim(),
        type: newCategory.type,
        isCustom: true,
        icon: ShoppingCart,
      },
    ]);

    // Reset the newCategory form fields
    form.setValue('newCategory', { name: '', type: 'expense' });
  };

  const handleRemoveCategory = (id: string) => {
    const categories = form.getValues('categories');
    form.setValue(
      'categories',
      categories.filter((category) => category.id !== id)
    );
  };

  // Update step 1 render
  const renderStepOne = () => (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  // Update step 2 render
  const renderStepTwo = () => (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {form.watch('accounts').map((account, index) => (
            <Card
              key={account.id}
              className="p-4 relative bg-card text-card-foreground"
            >
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const accounts = form.getValues('accounts');
                    form.setValue(
                      'accounts',
                      accounts.filter((_, i) => i !== index)
                    );
                  }}
                  className="absolute top-2 right-2 h-6 w-6 hover:bg-muted"
                  aria-label="Remove account"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name={`accounts.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            className="pl-9"
                            placeholder="e.g., Main Checking"
                          />
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {React.createElement(
                              accountTypeIcons[account.type],
                              { size: 20 }
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`accounts.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`accounts.${index}.balance`}
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel>Current Balance</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter current balance"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={handleAddAccount}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Account
          </Button>
        </div>
      </form>
    </Form>
  );

  const renderStepThree = () => (
    <Form {...form}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Expense Categories</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {form
              .watch('categories')
              .filter((cat) => cat.type === 'expense')
              .map((category) => (
                <Card
                  key={category.id}
                  className="p-3 flex justify-between items-center bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(category.icon, {
                      className: 'h-4 w-4 text-muted-foreground',
                    })}
                    <span className="text-sm text-card-foreground">
                      {category.name}
                    </span>
                  </div>
                  {category.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="h-6 w-6 hover:bg-muted"
                      aria-label={`Remove ${category.name} category`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              ))}
          </div>

          <div className="flex justify-between items-center">
            <Label className="text-lg font-semibold">Income Categories</Label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {form
              .watch('categories')
              .filter((cat) => cat.type === 'income')
              .map((category) => (
                <Card
                  key={category.id}
                  className="p-3 flex justify-between items-center bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {React.createElement(category.icon, {
                      className: 'h-4 w-4 text-muted-foreground',
                    })}
                    <span className="text-sm text-card-foreground">
                      {category.name}
                    </span>
                  </div>
                  {category.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveCategory(category.id)}
                      className="h-6 w-6 hover:bg-muted"
                      aria-label={`Remove ${category.name} category`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </Card>
              ))}
          </div>

          <Card className="p-4 bg-card text-card-foreground">
            <h3 className="font-medium mb-3">Add Custom Category</h3>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={form.control}
                  name="newCategory.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="categoryName">
                        Category Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter category name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <FormField
                  control={form.control}
                  name="newCategory.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="categoryType">
                        Category Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                onClick={handleAddCategory}
                className="w-full flex items-center justify-center gap-2"
                disabled={!form.getValues('newCategory.name')?.trim()}
              >
                <PlusIcon className="h-4 w-4" />
                Add Category
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Form>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      default:
        return null;
    }
  };

  console.log('currentStep', currentStep);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 space-y-6 bg-card text-card-foreground">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={(currentStep / steps.length) * 100} />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-foreground">
              {steps[currentStep - 1].title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
            <div className="mt-6">{renderStep()}</div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          <Button onClick={handleNext} className="flex items-center space-x-2">
            <span>{currentStep === steps.length ? 'Finish' : 'Next'}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
