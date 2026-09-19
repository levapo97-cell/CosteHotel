import { ArrowLeftRight, Pencil, Trash2 } from 'lucide-react';
import { Ingredient } from '@/types';
import { UNIT_LABELS, formatMoney } from '@/lib/costing';
import { formatQty, isLowStock } from '@/lib/inventory';

interface StockTableProps {
  products: Ingredient[];
  usageCount: (id: string) => number;
  onMove: (product: Ingredient) => void;
  onEdit: (product: Ingredient) => void;
  onDelete: (product: Ingredient) => void;
}

export function StockTable({ products, usageCount, onMove, onEdit, onDelete }: StockTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Producto</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Mínimo</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo promedio</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Recetas</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const unit = UNIT_LABELS[product.unitType];
            const low = isLowStock(product);
            const usedIn = usageCount(product.id);
            return (
              <tr key={product.id} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  {low && (
                    <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
                      Bajo mínimo
                    </span>
                  )}
                </td>
                <td className={`px-4 py-3 text-right ${low ? 'font-semibold text-red-600' : 'text-gray-700'}`}>
                  {formatQty(product.currentStock)} {unit}
                </td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {formatQty(product.minStock)} {unit}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatMoney(product.costPerUnit)} / {unit}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatMoney(product.costPerUnit * product.currentStock)}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{usedIn}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onMove(product)}
                      aria-label={`Registrar movimiento de ${product.name}`}
                      title="Registrar movimiento"
                      className="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      <ArrowLeftRight size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      aria-label={`Editar ${product.name}`}
                      title="Editar"
                      className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      disabled={usedIn > 0}
                      aria-label={`Eliminar ${product.name}`}
                      title={usedIn > 0 ? `No se puede eliminar: se usa en ${usedIn} receta(s)` : 'Eliminar'}
                      className="rounded p-1 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-transparent"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                No hay productos que mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
