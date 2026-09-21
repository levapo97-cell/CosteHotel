import { useInventoryStore } from '@/store/inventoryStore';
import { HOTELS, useWorkspaceStore } from '@/store/workspaceStore';
import { analyzeDish } from '@/lib/costing';
import { AREA_COPY } from '@/lib/inventory';

// Productos, recetas y movimientos del hotel y área seleccionados, con su análisis de costo.
export function useWorkspaceData() {
  const { hotelId, area } = useWorkspaceStore();
  const { ingredients, dishes, movements } = useInventoryStore();

  const products = ingredients.filter((ing) => ing.hotelId === hotelId && ing.area === area);
  const productIds = new Set(products.map((p) => p.id));
  const recipes = dishes
    .filter((dish) => dish.hotelId === hotelId && dish.area === area)
    .map((dish) => ({ dish, analysis: analyzeDish(dish, products) }));

  return {
    hotelId,
    area,
    hotelName: HOTELS.find((h) => h.id === hotelId)?.name ?? '',
    copy: AREA_COPY[area],
    products,
    recipes,
    movements: movements.filter((mov) => productIds.has(mov.ingredientId)),
    usageCount: (productId: string) =>
      recipes.filter(({ dish }) => dish.ingredients.some((item) => item.ingredientId === productId)).length,
  };
}
