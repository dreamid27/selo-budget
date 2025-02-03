import { useState } from 'react';
import { db } from '../db/db';
import { BudgetLimit, Category } from '../db/interfaces';
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

interface BudgetSettingsFormProps {
  categories: Category[];
  budgetLimits: BudgetLimit[];
  onClose: () => void;
}

const BudgetSettingsForm = ({
  categories,
  budgetLimits,
  onClose,
}: BudgetSettingsFormProps) => {
  const [limits, setLimits] = useState<{ [key: number]: number }>(
    budgetLimits.reduce(
      (acc, limit) => ({
        ...acc,
        [limit.categoryId]: limit.amount,
      }),
      {}
    )
  );

  const handleSave = async () => {
    // Delete existing limits
    await db.budgetLimits.clear();

    // Add new limits
    const newLimits = Object.entries(limits).map(([categoryId, amount]) => ({
      categoryId: parseInt(categoryId),
      amount: amount,
      period: 'monthly' as const,
      startDate: new Date(),
    }));

    await db.budgetLimits.bulkAdd(newLimits);
    onClose();
  };

  const handleLimitChange = (categoryId: number, value: string) => {
    const amount = parseFloat(value) || 0;
    setLimits((prev) => ({
      ...prev,
      [categoryId]: amount,
    }));
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        {categories
          .filter((category) => category.type === 'expense')
          .map((category) => (
            <div key={category.id} className="grid gap-2">
              <Label htmlFor={`limit-${category.id}`}>{category.name}</Label>
              <div className="flex gap-2">
                <Input
                  id={`limit-${category.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={limits[category.id!] || ''}
                  onChange={(e) =>
                    handleLimitChange(category.id!, e.target.value)
                  }
                  placeholder="Enter monthly limit"
                  className="flex-1"
                />
                <Select defaultValue="monthly" disabled>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default BudgetSettingsForm;
