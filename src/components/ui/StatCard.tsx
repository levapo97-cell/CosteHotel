interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: string;
}

export function StatCard({ label, value, subtext, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
        {icon && <span className="text-3xl">{icon}</span>}
      </div>
    </div>
  );
}
