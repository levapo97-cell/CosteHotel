import { Area, Ingredient, MovementType } from '@/types';

export function formatQty(value: number): string {
  return value.toLocaleString('es', { maximumFractionDigits: 3 });
}

export function isLowStock(ingredient: Ingredient): boolean {
  return ingredient.currentStock <= ingredient.minStock;
}

// Textos que cambian según el área: en el bar las recetas son bebidas.
export const AREA_COPY: Record<Area, Record<'label' | 'recipe' | 'recipes' | 'ofRecipe' | 'newRecipe' | 'newTitle' | 'example', string>> = {
  restaurant: {
    label: 'Restaurante',
    recipe: 'Plato',
    recipes: 'Platos',
    ofRecipe: 'del plato',
    newRecipe: 'Agregar plato',
    newTitle: 'Nuevo plato',
    example: 'Pollo a la Grilla',
  },
  bar: {
    label: 'Bar',
    recipe: 'Bebida',
    recipes: 'Bebidas',
    ofRecipe: 'de la bebida',
    newRecipe: 'Agregar bebida',
    newTitle: 'Nueva bebida',
    example: 'Mojito',
  },
};

export const MOVEMENT_TYPES: Record<MovementType, { label: string; hint: string }> = {
  purchase: { label: 'Compra', hint: 'Entra mercadería y actualiza el costo promedio.' },
  consumption: { label: 'Consumo', hint: 'Salida por uso en cocina o barra.' },
  waste: { label: 'Merma', hint: 'Producto vencido, dañado o desperdiciado.' },
  adjustment: { label: 'Ajuste', hint: 'Corrige el stock con un conteo físico.' },
};

const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'short', timeStyle: 'short' });

export function formatDateTime(iso: string): string {
  return dateFormatter.format(new Date(iso));
}
