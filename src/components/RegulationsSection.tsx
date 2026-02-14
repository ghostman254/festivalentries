import { useState } from 'react';
import { Clock, Users, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SCHOOL_CATEGORIES } from '@/lib/constants';
import { CATEGORY_REGULATIONS } from '@/lib/regulations';
import { cn } from '@/lib/utils';

export default function RegulationsSection() {
  const [activeCategory, setActiveCategory] = useState<string>(SCHOOL_CATEGORIES[0]);
  const regulations = CATEGORY_REGULATIONS[activeCategory] || [];

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4">
            Performance Regulations
          </h2>
          <div className="w-16 h-1 bg-secondary mx-auto rounded-full mb-4"></div>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Each category has specific items with time and cast limits. Select a category to view its regulations.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SCHOOL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200",
                activeCategory === cat
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Regulations Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary/5 border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-heading font-semibold text-foreground">
                      Code
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-heading font-semibold text-foreground">
                      Item
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-heading font-semibold text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Max Time
                      </span>
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-heading font-semibold text-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Max Cast
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {regulations.map((reg, idx) => (
                    <tr 
                      key={reg.itemType} 
                      className={cn(
                        "border-b border-border last:border-0 transition-colors hover:bg-muted/50",
                        idx % 2 === 0 ? "bg-card" : "bg-muted/20"
                      )}
                    >
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {reg.code}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground text-sm">{reg.itemType}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {reg.maxTime ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {reg.maxTime}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {reg.maxCast !== null ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {reg.maxCast}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Only items listed for your selected category will be available during registration.</p>
        </div>
      </div>
    </section>
  );
}
