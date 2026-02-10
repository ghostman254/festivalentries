import { useState } from 'react';
import { Trash2, Music, Theater, Mic2, Video, Radio, Podcast, Sparkles, FileText, Check, ChevronDown, Pencil, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ITEM_TYPES, LANGUAGES } from '@/lib/constants';
import { getItemRegulation } from '@/lib/regulations';
import type { ItemFormData } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  allowedItems?: string[];
  category?: string;
}

export function ItemFormCard({ index, item, onChange, onRemove, canRemove, errors, allowedItems, category }: ItemFormCardProps) {
  const [isOpen, setIsOpen] = useState(!item.itemType);
  const showLanguage = item.itemType === 'Play';
  const hasSelection = !!item.itemType;
  const displayItems = allowedItems && allowedItems.length > 0 ? ITEM_TYPES.filter(t => allowedItems.includes(t)) : ITEM_TYPES;
  const regulation = category && item.itemType ? getItemRegulation(category, item.itemType) : undefined;

  const handleItemSelect = (type: string) => {
    const newItem: ItemFormData = { ...item, itemType: type as any };
    if (type !== 'Play') {
      newItem.language = null;
      setIsOpen(false); // Collapse after selection (unless Play which needs language)
    }
    onChange(newItem);
  };

  const handleLanguageSelect = (lang: string) => {
    onChange({ ...item, language: lang as any });
    setIsOpen(false); // Collapse after language selection
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

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Selected item preview (shown when collapsed) */}
        {hasSelection && !isOpen && (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {itemIcons[item.itemType] || <Sparkles className="h-5 w-5" />}
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{item.itemType}</p>
                  {item.language && (
                    <p className="text-xs text-muted-foreground">Language: {item.language}</p>
                  )}
                  {regulation && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {regulation.maxTime}
                      </span>
                      {regulation.maxCast !== null && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" /> Max {regulation.maxCast}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Check className="h-4 w-4 text-primary ml-1" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Pencil className="h-3.5 w-3.5" />
                <span>Change</span>
              </div>
            </button>
          </CollapsibleTrigger>
        )}

        {/* Expand trigger when no selection */}
        {!hasSelection && !isOpen && (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <span className="text-muted-foreground">Select an item type</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </CollapsibleTrigger>
        )}

        <CollapsibleContent className="space-y-4">
          {/* Item Type Grid */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label>Select Item Type *</Label>
              {hasSelection && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Done
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {displayItems.map((type) => {
                const isSelected = item.itemType === type;
                const reg = category ? getItemRegulation(category, type) : undefined;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleItemSelect(type)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-200 text-center",
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
                    {reg && (
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-center">
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />{reg.maxTime}
                        </span>
                        {reg.maxCast !== null && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <Users className="h-2.5 w-2.5" />{reg.maxCast}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {errors?.itemType && <p className="text-sm text-destructive">{errors.itemType}</p>}
          </div>

          {/* Language Selection for Play */}
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
                      onClick={() => handleLanguageSelect(lang)}
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
