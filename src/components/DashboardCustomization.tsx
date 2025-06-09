
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Eye, EyeOff, GripVertical, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  size: 'small' | 'medium' | 'large';
}

interface DashboardCustomizationProps {
  widgets: DashboardWidget[];
  onUpdateWidgets: (widgets: DashboardWidget[]) => void;
  onResetToDefault: () => void;
}

export const DashboardCustomization = ({
  widgets,
  onUpdateWidgets,
  onResetToDefault
}: DashboardCustomizationProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState(widgets);

  const handleToggleWidget = (id: string) => {
    const updated = localWidgets.map(widget =>
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    );
    setLocalWidgets(updated);
  };

  const handleSizeChange = (id: string, size: 'small' | 'medium' | 'large') => {
    const updated = localWidgets.map(widget =>
      widget.id === id ? { ...widget, size } : widget
    );
    setLocalWidgets(updated);
  };

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const dragWidget = localWidgets[dragIndex];
    const newWidgets = [...localWidgets];
    newWidgets.splice(dragIndex, 1);
    newWidgets.splice(hoverIndex, 0, dragWidget);
    
    // Update order values
    const reorderedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      order: index
    }));
    
    setLocalWidgets(reorderedWidgets);
  };

  const handleSave = () => {
    onUpdateWidgets(localWidgets);
    setIsDialogOpen(false);
  };

  const handleCancel = () => {
    setLocalWidgets(widgets);
    setIsDialogOpen(false);
  };

  const getSizeLabel = (size: string) => {
    switch (size) {
      case 'small': return 'Small';
      case 'medium': return 'Medium';
      case 'large': return 'Large';
      default: return 'Medium';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'small': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-green-100 text-green-800';
      case 'large': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Drag to reorder, toggle visibility, and adjust widget sizes
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetToDefault}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          </div>

          <div className="space-y-3">
            {localWidgets
              .sort((a, b) => a.order - b.order)
              .map((widget, index) => (
                <Card key={widget.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="cursor-move">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{widget.name}</h4>
                        <Badge className={getSizeColor(widget.size)}>
                          {getSizeLabel(widget.size)}
                        </Badge>
                        {widget.enabled ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {widget.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`widget-${widget.id}`} className="text-sm">
                          Visible
                        </Label>
                        <Switch
                          id={`widget-${widget.id}`}
                          checked={widget.enabled}
                          onCheckedChange={() => handleToggleWidget(widget.id)}
                        />
                      </div>
                      
                      <div className="flex gap-1">
                        {['small', 'medium', 'large'].map((size) => (
                          <Button
                            key={size}
                            variant={widget.size === size ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleSizeChange(widget.id, size as any)}
                            className="px-2 py-1 text-xs"
                          >
                            {size[0].toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
