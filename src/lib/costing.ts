import { CostAnalysis, Dish, DishIngredient, Ingredient } from '@/types';

export type MarginStatus = 'optimal' | 'review' | 'critical';

export const MARGIN_OPTIMAL = 35;
export const MARGIN_REVIEW = 25;

export const UNIT_LABELS: Record<Ingredient['unitType'], string> = {
  kg: 'kg',
  g: 'g',
  l: 'L',
  ml: 'ml',
  unit: 'unid.',
};

export function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function dishCost(ingredients: DishIngredient[], allIngredients: Ingredient[]): number {
  return ingredients.reduce((total, item) => {
    const ingredient = allIngredients.find((ing) => ing.id === item.ingredientId);
    return total + (ingredient ? ingredient.costPerUnit * item.quantityNeeded : 0);
  }, 0);
}

export function analyzeDish(
  dish: Pick<Dish, 'id' | 'name' | 'sellingPrice' | 'ingredients'>,
  allIngredients: Ingredient[]
): CostAnalysis {
  const totalCost = dishCost(dish.ingredients, allIngredients);
  const margin = dish.sellingPrice - totalCost;
  const marginPercentage = dish.sellingPrice > 0 ? (margin / dish.sellingPrice) * 100 : 0;

  return {
    dishId: dish.id,
    dishName: dish.name,
    totalCost,
    sellingPrice: dish.sellingPrice,
    margin,
    marginPercentage,
  };
}

export function marginStatus(marginPercentage: number): MarginStatus {
  if (marginPercentage > MARGIN_OPTIMAL) return 'optimal';
  if (marginPercentage > MARGIN_REVIEW) return 'review';
  return 'critical';
}

export const MARGIN_BADGE: Record<MarginStatus, { label: string; className: string }> = {
  optimal: { label: 'Óptimo', className: 'bg-green-100 text-green-800' },
  review: { label: 'Revisar', className: 'bg-yellow-100 text-yellow-800' },
  critical: { label: 'Crítico', className: 'bg-red-100 text-red-800' },
};
