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
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-heading font-semibold text-foreground">
          Item {index + 1}
        </h4>
        {canRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
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
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Select item type" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {ITEM_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.itemType && <p className="text-sm text-destructive">{errors.itemType}</p>}
      </div>

      {showLanguage && (
        <div className="space-y-2 animate-fade-in">
          <Label>Language *</Label>
          <Select
            value={item.language || ''}
            onValueChange={(val) => onChange({ ...item, language: val as any })}
          >
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {LANGUAGES.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.language && <p className="text-sm text-destructive">{errors.language}</p>}
        </div>
      )}
    </div>
  );
}
