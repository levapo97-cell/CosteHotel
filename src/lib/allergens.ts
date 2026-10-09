import { Allergen, Dish, Ingredient } from '@/types';

// Catálogo de los 14 alérgenos de declaración obligatoria (UE), en el orden oficial.
export const ALLERGENS: { id: Allergen; label: string }[] = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'crustaceos', label: 'Crustáceos' },
  { id: 'huevos', label: 'Huevos' },
  { id: 'pescado', label: 'Pescado' },
  { id: 'cacahuetes', label: 'Cacahuetes' },
  { id: 'soja', label: 'Soja' },
  { id: 'lacteos', label: 'Lácteos' },
  { id: 'frutos_secos', label: 'Frutos secos' },
  { id: 'apio', label: 'Apio' },
  { id: 'mostaza', label: 'Mostaza' },
  { id: 'sesamo', label: 'Sésamo' },
  { id: 'sulfitos', label: 'Sulfitos' },
  { id: 'altramuces', label: 'Altramuces' },
  { id: 'moluscos', label: 'Moluscos' },
];

const ORDER = new Map(ALLERGENS.map((item, index) => [item.id, index]));

export function allergenLabel(id: Allergen): string {
  return ALLERGENS.find((item) => item.id === id)?.label ?? id;
}

// Únicos y en el orden oficial, para que la lista se vea siempre igual.
export function sortAllergens(list: Allergen[]): Allergen[] {
  return [...new Set(list)].sort((a, b) => (ORDER.get(a) ?? 99) - (ORDER.get(b) ?? 99));
}

// Alérgenos que la receta hereda de sus ingredientes y subrecetas (recursivo), SIN los
// manuales del propio plato. `seen` corta referencias circulares A -> B -> A.
export function autoAllergens(
  recipe: Pick<Dish, 'id' | 'ingredients' | 'subrecipes'>,
  allIngredients: Ingredient[],
  allRecipes: Dish[],
  seen: Set<string> = new Set()
): Allergen[] {
  if (recipe.id && seen.has(recipe.id)) return [];
  const nextSeen = new Set(seen);
  if (recipe.id) nextSeen.add(recipe.id);

  const set = new Set<Allergen>();
  for (const item of recipe.ingredients ?? []) {
    const ingredient = allIngredients.find((ing) => ing.id === item.ingredientId);
    ingredient?.allergens?.forEach((a) => set.add(a));
  }
  for (const sub of recipe.subrecipes ?? []) {
    const subRecipe = allRecipes.find((r) => r.id === sub.recipeId);
    if (subRecipe) effectiveAllergens(subRecipe, allIngredients, allRecipes, nextSeen).forEach((a) => set.add(a));
  }
  return sortAllergens([...set]);
}

// Alérgenos efectivos de la receta: los heredados (auto) + los añadidos manualmente.
export function effectiveAllergens(
  recipe: Pick<Dish, 'id' | 'ingredients' | 'subrecipes' | 'allergens'>,
  allIngredients: Ingredient[],
  allRecipes: Dish[],
  seen: Set<string> = new Set()
): Allergen[] {
  const set = new Set<Allergen>(autoAllergens(recipe, allIngredients, allRecipes, seen));
  (recipe.allergens ?? []).forEach((a) => set.add(a));
  return sortAllergens([...set]);
}
