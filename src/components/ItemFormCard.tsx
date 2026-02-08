import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ITEM_TYPES, LANGUAGES } from '@/lib/constants';
import type { ItemFormData } from '@/lib/validation';

interface ItemFormCardProps {
  index: number;
  item: ItemFormData;
  onChange: (item: ItemFormData) => void;
  onRemove: () => void;
  canRemove: boolean;
  errors?: Record<string, string>;
}

export function ItemFormCard({ index, item, onChange, onRemove, canRemove, errors }: ItemFormCardProps) {
  const showLanguage = item.itemType === 'Play';

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 hover-raise hover-glow-primary transition-all duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          Item {index + 1}
        </h4>
        {canRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove} 
            className="text-destructive hover:text-destructive hover:scale-110 transition-transform duration-200"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Item Type *</Label>
        <Select
          value={item.itemType || ''}
          onValueChange={(val) => {
            const newItem: ItemFormData = { ...item, itemType: val as any };
            if (val !== 'Play') newItem.language = null;
            onChange(newItem);
          }}
        >
          <SelectTrigger className="bg-card transition-all duration-200 hover:border-primary/50">
            <SelectValue placeholder="Select item type" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {ITEM_TYPES.map(t => (
              <SelectItem key={t} value={t} className="transition-colors duration-150">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.itemType && <p className="text-sm text-destructive animate-fade-in">{errors.itemType}</p>}
      </div>

      {showLanguage && (
        <div className="space-y-2 animate-fade-in">
          <Label>Language *</Label>
          <Select
            value={item.language || ''}
            onValueChange={(val) => onChange({ ...item, language: val as any })}
          >
            <SelectTrigger className="bg-card transition-all duration-200 hover:border-primary/50">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {LANGUAGES.map(l => (
                <SelectItem key={l} value={l} className="transition-colors duration-150">{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.language && <p className="text-sm text-destructive animate-fade-in">{errors.language}</p>}
        </div>
      )}
    </div>
  );
}