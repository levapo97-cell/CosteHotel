import { describe, expect, it } from 'vitest';
import { Dish, Ingredient } from '@/types';
import { autoAllergens, effectiveAllergens, sortAllergens } from './allergens';

const ing = (id: string, allergens?: Ingredient['allergens']): Ingredient => ({
  id,
  hotelId: 'h1',
  area: 'restaurant',
  name: id,
  unitType: 'kg',
  costPerUnit: 1,
  currentStock: 10,
  minStock: 1,
  lastUpdated: '2026-01-01',
  allergens,
});

const dish = (id: string, extra: Partial<Dish>): Dish => ({
  id,
  hotelId: 'h1',
  area: 'restaurant',
  name: id,
  sellingPrice: 10,
  ingredients: [],
  ...extra,
});

describe('allergens', () => {
  it('reúne los alérgenos de los ingredientes del plato', () => {
    const products = [ing('harina', ['gluten']), ing('leche', ['lacteos'])];
    const d = dish('d1', {
      ingredients: [
        { ingredientId: 'harina', quantityNeeded: 1 },
        { ingredientId: 'leche', quantityNeeded: 1 },
      ],
    });
    expect(effectiveAllergens(d, products, [])).toEqual(['gluten', 'lacteos']);
  });

  it('hereda los alérgenos de las subrecetas de forma recursiva', () => {
    const products = [ing('harina', ['gluten']), ing('gamba', ['crustaceos'])];
    const salsa = dish('salsa', { isSubrecipe: true, ingredients: [{ ingredientId: 'gamba', quantityNeeded: 0.1 }] });
    const plato = dish('plato', {
      ingredients: [{ ingredientId: 'harina', quantityNeeded: 1 }],
      subrecipes: [{ recipeId: 'salsa', quantityNeeded: 0.2 }],
    });
    expect(effectiveAllergens(plato, products, [salsa, plato])).toEqual(['gluten', 'crustaceos']);
  });

  it('suma los alérgenos manuales a los heredados, sin duplicar', () => {
    const products = [ing('harina', ['gluten'])];
    const d = dish('d1', {
      ingredients: [{ ingredientId: 'harina', quantityNeeded: 1 }],
      allergens: ['gluten', 'sesamo'], // gluten ya viene del ingrediente → no se duplica
    });
    expect(effectiveAllergens(d, products, [])).toEqual(['gluten', 'sesamo']);
  });

  it('autoAllergens no incluye los manuales del propio plato', () => {
    const products = [ing('harina', ['gluten'])];
    const d = dish('d1', { ingredients: [{ ingredientId: 'harina', quantityNeeded: 1 }], allergens: ['sesamo'] });
    expect(autoAllergens(d, products, [])).toEqual(['gluten']);
  });

  it('no entra en bucle con recetas circulares A -> B -> A', () => {
    const products = [ing('harina', ['gluten'])];
    const a = dish('a', { ingredients: [{ ingredientId: 'harina', quantityNeeded: 1 }], subrecipes: [{ recipeId: 'b', quantityNeeded: 1 }] });
    const b = dish('b', { subrecipes: [{ recipeId: 'a', quantityNeeded: 1 }] });
    expect(() => effectiveAllergens(a, products, [a, b])).not.toThrow();
    expect(effectiveAllergens(a, products, [a, b])).toEqual(['gluten']);
  });

  it('ordena y deduplica en el orden oficial', () => {
    expect(sortAllergens(['lacteos', 'gluten', 'gluten', 'huevos'])).toEqual(['gluten', 'huevos', 'lacteos']);
  });
});
