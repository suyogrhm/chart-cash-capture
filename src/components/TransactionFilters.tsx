
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { Category, Account } from '@/types/Transaction';

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  amountRange: { min: string; max: string };
  onAmountRangeChange: (range: { min: string; max: string }) => void;
  categories: Category[];
  accounts: Account[];
  onClearFilters: () => void;
}

export const TransactionFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedAccount,
  onAccountChange,
  selectedType,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  amountRange,
  onAmountRangeChange,
  categories,
  accounts,
  onClearFilters
}: TransactionFiltersProps) => {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
        </div>
        <Button variant="outline" size="sm" onClick={onClearFilters} className="border-border/50 bg-background/50 hover:bg-accent/50">
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enhanced Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, category, or message..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
          />
        </div>

        {/* Type Filter */}
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/50">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/50">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon} {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Account Filter */}
        <Select value={selectedAccount} onValueChange={onAccountChange}>
          <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-sm border-border/50">
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal bg-background/50 border-border/50 hover:bg-accent/50">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover/95 backdrop-blur-sm border-border/50" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => onDateRangeChange(range || {})}
              numberOfMonths={2}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Amount Range */}
        <div className="flex gap-2">
          <Input
            placeholder="Min amount"
            value={amountRange.min}
            onChange={(e) => onAmountRangeChange({ ...amountRange, min: e.target.value })}
            type="number"
            className="bg-background/50 border-border/50 focus:border-primary/50"
          />
          <Input
            placeholder="Max amount"
            value={amountRange.max}
            onChange={(e) => onAmountRangeChange({ ...amountRange, max: e.target.value })}
            type="number"
            className="bg-background/50 border-border/50 focus:border-primary/50"
          />
        </div>
      </div>
    </Card>
  );
};
