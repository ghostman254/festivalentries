import { Trash2, Music, Theater, Mic2, Video, Radio, Podcast, Sparkles, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ITEM_TYPES, LANGUAGES } from '@/lib/constants';
import type { ItemFormData } from '@/lib/validation';
import { cn } from '@/lib/utils';

const itemIcons: Record<string, React.ReactNode> = {
  'Choral Verse': <Music className="h-5 w-5" />,
  'Play': <Theater className="h-5 w-5" />,
  'Spoken Word': <Mic2 className="h-5 w-5" />,
  'Solo Verse': <Mic2 className="h-5 w-5" />,
  'Modern Dance': <Sparkles className="h-5 w-5" />,
  'Comedy': <Theater className="h-5 w-5" />,
  'Live Broadcast': <Radio className="h-5 w-5" />,
  'Podcast': <Podcast className="h-5 w-5" />,
  'Singing Games': <Music className="h-5 w-5" />,
  'Narratives': <FileText className="h-5 w-5" />,
  'Cultural Creative Dance': <Sparkles className="h-5 w-5" />,
  'Video Song': <Video className="h-5 w-5" />,
  'Documentary': <Video className="h-5 w-5" />,
  'Advert': <Video className="h-5 w-5" />,
};

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

  const handleItemSelect = (type: string) => {
    const newItem: ItemFormData = { ...item, itemType: type as any };
    if (type !== 'Play') newItem.language = null;
    onChange(newItem);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-heading font-semibold text-foreground flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            {index + 1}
          </span>
          Item {index + 1}
        </h4>
        {canRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove} 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <Label>Select Item Type *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {ITEM_TYPES.map((type) => {
            const isSelected = item.itemType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleItemSelect(type)}
                className={cn(
                  "relative flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-200 text-center",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "transition-colors",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}>
                  {itemIcons[type] || <Sparkles className="h-5 w-5" />}
                </div>
                <span className={cn(
                  "text-xs font-medium leading-tight",
                  isSelected ? "text-primary" : ""
                )}>
                  {type}
                </span>
              </button>
            );
          })}
        </div>
        {errors?.itemType && <p className="text-sm text-destructive">{errors.itemType}</p>}
      </div>

      {showLanguage && (
        <div className="space-y-3 pt-2 border-t border-border">
          <Label>Select Language for Play *</Label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = item.language === lang;
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onChange({ ...item, language: lang as any })}
                  className={cn(
                    "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200",
                    isSelected
                      ? "border-secondary bg-secondary text-secondary-foreground shadow-sm"
                      : "border-border bg-background hover:border-secondary/50 hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lang}
                </button>
              );
            })}
          </div>
          {errors?.language && <p className="text-sm text-destructive">{errors.language}</p>}
        </div>
      )}
    </div>
  );
}
