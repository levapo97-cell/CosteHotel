interface TabsProps<T extends string> {
  label: string;
  value: T;
  tabs: { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}

// Pestañas de texto: la activa se marca con un subrayado de 2px sobre el borde del grupo.
export function Tabs<T extends string>({ label, value, tabs, onChange }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-6 overflow-x-auto border-b border-line">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`-mb-px flex items-center gap-2 border-b-2 py-3 text-sm whitespace-nowrap transition-colors ${
              active ? 'border-accent font-semibold text-accent-text' : 'border-transparent font-medium text-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`rounded-chip px-1.5 py-0.5 text-[11px] font-semibold ${
                  active ? 'bg-accent/10 text-accent-text' : 'bg-ink/[0.05] text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
