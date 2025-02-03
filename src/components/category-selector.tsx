import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Check, Search } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'expense' | 'income';
  group?: string;
}

const CategorySelector = ({
  categories,
  selectedCategory,
  type,
  onSelect,
}: {
  categories: Category[];
  selectedCategory: number;
  type: 'expense' | 'income';
  onSelect: (categoryId: number) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Group categories by their group/type
  const groupedCategories = useMemo(() => {
    const filtered = categories.filter((cat) => cat.type === type);
    return filtered.reduce((acc, category) => {
      const group = category.group || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(category);
      return acc;
    }, {} as Record<string, Category[]>);
  }, [categories, type]);

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory
  );

  return (
    <div className="relative">
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between h-auto p-4"
        onClick={() => setOpen(!open)}
      >
        {selectedCategory ? (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                type === 'expense'
                  ? 'bg-red-100 text-red-600'
                  : 'bg-green-100 text-green-600'
              )}
            >
              {selectedCategoryData?.icon}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">
                {selectedCategoryData?.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {selectedCategoryData?.group || 'Other'}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Select category</span>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] sm:max-h-[90dvh] p-4 fixed bottom-0 right-0 w-[100vw] h-[100dvh] overflow-auto overscroll-y-none pointer-events-auto">
          <div className="p-4 pb-0">
            <div className="flex items-center gap-2 border rounded-lg px-3 mb-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                className="flex h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
              />
            </div>
            <ScrollArea className="h-[300px]">
              {Object.entries(groupedCategories).map(([group, items]) => {
                const filteredItems = items.filter(
                  (item) =>
                    item.name.toLowerCase().includes(search) ||
                    group.toLowerCase().includes(search)
                );

                if (filteredItems.length === 0) return null;

                return (
                  <div key={group} className="mb-4">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      {group}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredItems.map((category) => (
                        <Button
                          key={category.id}
                          variant="outline"
                          className={cn(
                            'flex items-center gap-2 h-auto p-3 justify-start',
                            selectedCategory === category.id &&
                              'border-primary bg-primary/5'
                          )}
                          onClick={() => {
                            onSelect(category.id);
                            setOpen(false);
                          }}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                              type === 'expense'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            )}
                          >
                            {category.icon}
                          </div>
                          <span className="text-sm font-medium truncate">
                            {category.name}
                          </span>
                          {selectedCategory === category.id && (
                            <Check className="h-4 w-4 text-primary ml-auto" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {!Object.values(groupedCategories).some((group) =>
                group.some((item) =>
                  item.name.toLowerCase().includes(search.toLowerCase())
                )
              ) && (
                <div className="text-center py-6 text-muted-foreground">
                  No categories found
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategorySelector;
