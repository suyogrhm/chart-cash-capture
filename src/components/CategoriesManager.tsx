
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Settings } from 'lucide-react';
import { Category } from '@/types/Transaction';

interface CategoriesManagerProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onEditCategory: (id: string, category: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoriesManager = ({ 
  categories, 
  onAddCategory, 
  onEditCategory, 
  onDeleteCategory 
}: CategoriesManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6',
    icon: '📁'
  });

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      onAddCategory(newCategory);
      setNewCategory({ name: '', type: 'expense', color: '#3B82F6', icon: '📁' });
      setIsAddDialogOpen(false);
    }
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
  const icons = ['📁', '🍽️', '🚗', '🎮', '💰', '🏠', '💊', '🛒', '🎬', '⚡'];

  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Manage Categories</h2>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              
              <div className="flex gap-2">
                <Button
                  variant={newCategory.type === 'expense' ? 'default' : 'outline'}
                  onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                >
                  Expense
                </Button>
                <Button
                  variant={newCategory.type === 'income' ? 'default' : 'outline'}
                  onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                >
                  Income
                </Button>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Color</p>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color ? 'border-foreground' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Icon</p>
                <div className="flex gap-2 flex-wrap">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      className={`p-2 rounded border ${
                        newCategory.icon === icon ? 'bg-primary text-primary-foreground' : 'bg-background'
                      }`}
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleAddCategory} className="w-full">
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>
              <div>
                <p className="font-medium">{category.name}</p>
                <Badge variant={category.type === 'income' ? 'default' : 'secondary'}>
                  {category.type}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDeleteCategory(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
