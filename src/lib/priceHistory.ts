import { Ingredient, MovementType, StockMovement } from '@/types';

// Historial de precios de un producto (§35 del análisis). El store solo guarda el
// costo promedio ponderado actual, pero se reconstruye la línea de tiempo
// reproduciendo los movimientos en orden cronológico: solo las compras cambian el
// promedio; el stock inicial (primer movimiento) fija el costo base.
export interface PricePoint {
  date: string; // ISO
  type: MovementType;
  unitCost: number; // costo unitario del movimiento (precio de compra)
  avgCost: number; // costo promedio ponderado resultante, vigente desde esta fecha
  quantity: number; // delta con signo
  stockAfter: number;
}

export function priceHistory(ingredientId: string, movements: StockMovement[]): PricePoint[] {
  const chronological = movements
    .filter((mov) => mov.ingredientId === ingredientId)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));

  let stock = 0;
  let avg = 0;
  const points: PricePoint[] = [];

  for (const mov of chronological) {
    if (mov.type === 'purchase') {
      const qty = mov.quantity; // delta positivo
      const next = stock + qty;
      avg = stock > 0 && next > 0 ? (stock * avg + qty * mov.unitCost) / next : mov.unitCost;
      stock = next;
    } else if (stock === 0 && avg === 0) {
      // Stock inicial: fija el costo base sin promediar.
      avg = mov.unitCost;
      stock = mov.stockAfter;
    } else {
      // Ajuste, consumo y merma mueven el stock pero no el costo.
      stock = mov.stockAfter;
    }
    points.push({
      date: mov.date,
      type: mov.type,
      unitCost: mov.unitCost,
      avgCost: avg,
      quantity: mov.quantity,
      stockAfter: mov.stockAfter,
    });
  }

  return points;
}

// Solo los puntos donde el costo promedio efectivamente cambió (para mostrar la
// evolución sin repetir la misma cifra en cada consumo o ajuste).
export function costChangePoints(ingredientId: string, movements: StockMovement[]): PricePoint[] {
  const points = priceHistory(ingredientId, movements);
  return points.filter((point, index) => index === 0 || point.avgCost !== points[index - 1].avgCost);
}

// Costo promedio ponderado vigente en una fecha dada. `asOf` puede ser 'YYYY-MM-DD'
// (se toma como fin del día) o un ISO completo. Antes del primer movimiento se usa
// el costo base; si no hay historial, el costo actual del producto.
export function unitCostAsOf(ingredient: Ingredient, movements: StockMovement[], asOf: string): number {
  const points = priceHistory(ingredient.id, movements);
  if (points.length === 0) return ingredient.costPerUnit;

  const cutoff = asOf.length <= 10 ? `${asOf}T23:59:59.999Z` : asOf;
  let cost = points[0].avgCost;
  for (const point of points) {
    if (point.date <= cutoff) cost = point.avgCost;
    else break;
  }
  return cost;
}

// Productos con su costo vigente a una fecha, para recostear recetas en un periodo.
export function productsAsOf(products: Ingredient[], movements: StockMovement[], asOf: string): Ingredient[] {
  return products.map((product) => ({ ...product, costPerUnit: unitCostAsOf(product, movements, asOf) }));
}
