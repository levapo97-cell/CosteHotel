'use client';

import { Allergen } from '@/types';
import { ALLERGENS, allergenLabel } from '@/lib/allergens';
import { Badge } from '@/components/ui/Badge';

interface AllergenPickerProps {
  selected: Allergen[];
  onChange: (next: Allergen[]) => void;
  // Alérgenos heredados de ingredientes/subrecetas: van marcados y bloqueados (se calculan solos).
  autoSelected?: Allergen[];
}

// Rejilla de los 14 alérgenos. Los heredados se muestran marcados con la etiqueta "auto"
// y no se pueden desmarcar; el resto se añaden manualmente a la elaboración.
export function AllergenPicker({ selected, onChange, autoSelected = [] }: AllergenPickerProps) {
  const autoSet = new Set(autoSelected);
  const selectedSet = new Set(selected);

  const toggle = (id: Allergen) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {ALLERGENS.map(({ id, label }) => {
        const auto = autoSet.has(id);
        const checked = auto || selectedSet.has(id);
        return (
          <label
            key={id}
            className={`flex items-center gap-2 rounded-control border px-3 py-2 text-sm transition-colors ${
              checked ? 'border-warn/40 bg-warn/5' : 'border-line'
            } ${auto ? 'cursor-default' : 'cursor-pointer hover:bg-ink/[0.03]'}`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={auto}
              onChange={() => toggle(id)}
              className="h-4 w-4 accent-accent"
            />
            <span className={`min-w-0 truncate ${checked ? 'font-medium text-ink' : 'text-muted'}`}>{label}</span>
            {auto && <span className="ml-auto shrink-0 text-[10px] tracking-wide text-muted uppercase">auto</span>}
          </label>
        );
      })}
    </div>
  );
}

// Lista de alérgenos de solo lectura (ficha técnica, tarjetas).
export function AllergenChips({ allergens }: { allergens: Allergen[] }) {
  if (allergens.length === 0) {
    return <span className="text-[13px] text-muted">Sin alérgenos declarados</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {allergens.map((id) => (
        <Badge key={id} tone="warn">
          {allergenLabel(id)}
        </Badge>
      ))}
    </div>
  );
}
