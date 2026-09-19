import { Ingredient, StockMovement } from '@/types';
import { UNIT_LABELS, formatMoney } from '@/lib/costing';
import { MOVEMENT_TYPES, formatDateTime, formatQty } from '@/lib/inventory';

interface MovementsTableProps {
  movements: StockMovement[];
  productsById: Map<string, Ingredient>;
}

export function MovementsTable({ movements, productsById }: MovementsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Producto</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Cantidad</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo unit.</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock final</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Nota</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Usuario</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => {
            const product = productsById.get(movement.ingredientId);
            const unit = product ? UNIT_LABELS[product.unitType] : '';
            const type = MOVEMENT_TYPES[movement.type];
            return (
              <tr key={movement.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDateTime(movement.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{product?.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${type.className}`}>{type.label}</span>
                </td>
                <td
                  className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                    movement.quantity < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {movement.quantity > 0 ? '+' : ''}
                  {formatQty(movement.quantity)} {unit}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{formatMoney(movement.unitCost)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700">
                  {formatQty(movement.stockAfter)} {unit}
                </td>
                <td className="px-4 py-3 text-gray-600">{movement.note}</td>
                <td className="px-4 py-3 text-gray-600">{movement.userName}</td>
              </tr>
            );
          })}
          {movements.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                No hay movimientos que mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
