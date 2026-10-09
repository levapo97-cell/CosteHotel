import { Ingredient, StockMovement } from '@/types';

export interface CostChange {
  product: Ingredient;
  previousCost: number;
  currentCost: number;
  percent: number;
  date: string;
}

// Variación del costo promedio causada por la última compra de un producto. El store no
// guarda el costo anterior, pero se despeja del promedio ponderado:
//   actual = (stockPrevio·anterior + cantidad·precio) / stockFinal
// Solo las compras cambian el costo, así que el costo actual es el que dejó esa compra.
export function lastCostChange(product: Ingredient, movements: StockMovement[]): CostChange | null {
  const purchase = movements
    .filter((mov) => mov.ingredientId === product.id && mov.type === 'purchase')
    .reduce<StockMovement | null>((latest, mov) => (!latest || mov.date > latest.date ? mov : latest), null);
  if (!purchase) return null;

  const previousStock = purchase.stockAfter - purchase.quantity;
  if (previousStock <= 0) return null; // sin stock previo no hay costo anterior con qué comparar

  const currentCost = product.costPerUnit;
  const previousCost = (purchase.stockAfter * currentCost - purchase.quantity * purchase.unitCost) / previousStock;
  if (previousCost <= 0) return null;

  return {
    product,
    previousCost,
    currentCost,
    percent: ((currentCost - previousCost) / previousCost) * 100,
    date: purchase.date,
  };
}

// Desviación del promedio ponderado actual frente al coste de referencia aceptado.
// Positiva = el producto está más caro que su referencia (subida de proveedor).
// Devuelve null si no hay referencia con qué comparar.
export function referenceDeviation(product: Ingredient): { percent: number; amount: number } | null {
  const reference = product.referenceCost;
  if (!reference || reference <= 0) return null;
  const amount = product.costPerUnit - reference;
  return { amount, percent: (amount / reference) * 100 };
}

export function latestCostChange(products: Ingredient[], movements: StockMovement[]): CostChange | null {
  return products
    .map((product) => lastCostChange(product, movements))
    .reduce<CostChange | null>((latest, change) => (change && (!latest || change.date > latest.date) ? change : latest), null);
}
