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

  // Catálogo completo del área (incluye subrecetas internas como salsas).
  const recipeCatalog = dishes.filter((dish) => dish.hotelId === hotelId && dish.area === area);

  // La carta solo muestra recetas vendibles; las subrecetas quedan ocultas.
  const recipes = recipeCatalog
    .filter((dish) => !dish.isSubrecipe)
    .map((dish) => ({ dish, analysis: analyzeDish(dish, products, recipeCatalog) }));

  return {
    hotelId,
    area,
    hotelName: HOTELS.find((h) => h.id === hotelId)?.name ?? '',
    copy: AREA_COPY[area],
    products,
    recipes,
    recipeCatalog,
    movements: movements.filter((mov) => productIds.has(mov.ingredientId)),
    usageCount: (productId: string) =>
      recipeCatalog.filter((dish) => dish.ingredients.some((item) => item.ingredientId === productId)).length,
  };
}
