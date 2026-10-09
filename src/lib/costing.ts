import { Channel, ChannelAnalysis, CostAnalysis, Dish, Ingredient, UnitType } from '@/types';

export type MarginStatus = 'optimal' | 'review' | 'critical';

export const MARGIN_OPTIMAL = 35;
export const MARGIN_REVIEW = 25;

export const UNIT_LABELS: Record<UnitType, string> = {
  kg: 'kg',
  g: 'g',
  lb: 'lb',
  oz: 'oz',
  l: 'L',
  ml: 'ml',
  cl: 'cL',
  unit: 'pz',
};

// Etiquetas largas para los selectores de unidad.
export const UNIT_DESCRIPTIONS: Record<UnitType, string> = {
  kg: 'Kilogramo (kg)',
  g: 'Gramo (g)',
  lb: 'Libra (lb)',
  oz: 'Onza (oz)',
  l: 'Litro (L)',
  ml: 'Mililitro (ml)',
  cl: 'Centilitro (cL)',
  unit: 'Unidad (pz)',
};

export type UnitDimension = 'mass' | 'volume' | 'count';

export const UNIT_DIMENSION: Record<UnitType, UnitDimension> = {
  kg: 'mass',
  g: 'mass',
  lb: 'mass',
  oz: 'mass',
  l: 'volume',
  ml: 'volume',
  cl: 'volume',
  unit: 'count',
};

// Normalización de unidades a una base por dimensión:
// masa -> g, volumen -> ml, conteo -> pz. Así 1 lb (453.592 g) y 16 oz son lo mismo.
const UNIT_FACTOR: Record<UnitType, number> = {
  kg: 1000,
  g: 1,
  lb: 453.59237,
  oz: 28.349523125,
  l: 1000,
  ml: 1,
  cl: 10,
  unit: 1,
};

export function toBaseQuantity(quantity: number, unit: UnitType): number {
  return quantity * UNIT_FACTOR[unit];
}

// Unidades a las que se puede convertir una unidad dada (misma dimensión). Sirve para
// que en la receta se pueda elegir oz aunque el producto esté en lb, pero no ml.
export function compatibleUnits(unit: UnitType): UnitType[] {
  const dimension = UNIT_DIMENSION[unit];
  return (Object.keys(UNIT_DIMENSION) as UnitType[]).filter((u) => UNIT_DIMENSION[u] === dimension);
}

// Convierte una cantidad entre unidades de la MISMA dimensión. Si no son compatibles,
// devuelve la cantidad sin tocar (el llamador ya valida la dimensión).
export function convertQuantity(quantity: number, from: UnitType, to: UnitType): number {
  if (from === to || UNIT_DIMENSION[from] !== UNIT_DIMENSION[to]) return quantity;
  return (quantity * UNIT_FACTOR[from]) / UNIT_FACTOR[to];
}

export const DEFAULT_TAX_RATE = 8.25;
export const DEFAULT_TARGET_FOOD_COST = 30;

export const DEFAULT_CHANNELS: Channel[] = [
  { id: 'local', name: 'En el local', commissionType: 'percentage', commissionValue: 2.24, description: 'Comisión bancaria' },
  { id: 'delivery', name: 'Delivery propio', commissionType: 'percentage', commissionValue: 0, description: 'Sin comisión de plataforma' },
  { id: 'uber', name: 'Uber', commissionType: 'percentage', commissionValue: 25, description: 'Comisión de la plataforma' },
  { id: 'rappi', name: 'Rappi', commissionType: 'percentage', commissionValue: 30, description: 'Comisión de la plataforma' },
];

export function formatMoney(value: number): string {
  return `$${value.toFixed(2)}`;
}

// Merma válida: 0..<100. 100% genera división entre cero (caso límite del análisis).
function clampWaste(wastePercent: number): number {
  if (!Number.isFinite(wastePercent)) return 0;
  return Math.min(Math.max(wastePercent, 0), 99.999);
}

// cantidad_bruta = cantidad_neta / (1 - merma)
export function grossQuantity(netQuantity: number, wastePercent: number): number {
  return netQuantity / (1 - clampWaste(wastePercent) / 100);
}

// Coste de una línea de ingrediente para la cantidad indicada, incluyendo la merma.
// Usa el mismo modelo que el motor: se toma la cantidad bruta que sale de inventario y se
// multiplica por el coste normalizado por unidad base ($ por g/ml/pz). La receta puede
// expresarse en otra unidad de la misma dimensión que el producto (ej. producto en lb,
// receta en oz) y se convierte sola.
export function ingredientLineCost(
  ingredient: Ingredient,
  quantityNeeded: number,
  recipeUnit: UnitType | undefined,
  wastePercent: number
): number {
  if (!(quantityNeeded > 0) || (wastePercent ?? 0) >= 100) return 0;
  const recipeUnitResolved =
    recipeUnit && UNIT_DIMENSION[recipeUnit] === UNIT_DIMENSION[ingredient.unitType]
      ? recipeUnit
      : ingredient.unitType;
  const gross = grossQuantity(quantityNeeded, wastePercent ?? 0);
  const costPerBaseUnit = ingredient.costPerUnit / UNIT_FACTOR[ingredient.unitType]; // $ por g/ml/pz
  return toBaseQuantity(gross, recipeUnitResolved) * costPerBaseUnit;
}

export interface RecipeCostDetail {
  ingredientCost: number;
  subrecipeCost: number;
  packagingCost: number;
  baseCost: number;
  safetyMarginAmount: number;
  finalCost: number;
  costPerServing: number;
  warnings: string[];
}

function zeroDetail(warnings: string[]): RecipeCostDetail {
  return {
    ingredientCost: 0,
    subrecipeCost: 0,
    packagingCost: 0,
    baseCost: 0,
    safetyMarginAmount: 0,
    finalCost: 0,
    costPerServing: 0,
    warnings,
  };
}

// Motor de costeo: ingredientes + subrecetas (recursivo) + packaging, con margen de
// seguridad y coste por porción. `seen` rompe las referencias circulares (A -> B -> A).
export function calculateRecipeCost(
  recipe: Dish,
  allIngredients: Ingredient[],
  allRecipes: Dish[],
  seen: Set<string> = new Set()
): RecipeCostDetail {
  const warnings: string[] = [];

  if (seen.has(recipe.id)) {
    warnings.push(`Receta circular detectada en "${recipe.name}": la subreceta se omite del coste.`);
    return zeroDetail(warnings);
  }
  const nextSeen = new Set(seen);
  nextSeen.add(recipe.id);

  // 1) Ingredientes: cantidad bruta × coste normalizado por unidad base.
  let ingredientCost = 0;
  for (const item of recipe.ingredients ?? []) {
    const ingredient = allIngredients.find((ing) => ing.id === item.ingredientId);
    if (!ingredient) continue;

    const waste = item.wastePercent ?? 0;
    if (waste >= 100) {
      warnings.push(`"${ingredient.name}" tiene merma de ${waste}%: debe ser menor al 100%.`);
      continue;
    }

    // La receta puede expresarse en otra unidad de la misma dimensión (ej: producto en
    // lb, receta en oz). Se convierte a la base para costear con el costo del producto.
    ingredientCost += ingredientLineCost(ingredient, item.quantityNeeded, item.unit, waste);
  }

  // 2) Subrecetas: coste unitario de la subreceta × cantidad utilizada.
  let subrecipeCost = 0;
  for (const sub of recipe.subrecipes ?? []) {
    const subRecipe = allRecipes.find((r) => r.id === sub.recipeId);
    if (!subRecipe) continue;
    if (seen.has(subRecipe.id)) {
      warnings.push(`Receta circular detectada en "${recipe.name}": "${subRecipe.name}" se omite.`);
      continue;
    }

    const detail = calculateRecipeCost(subRecipe, allIngredients, allRecipes, nextSeen);
    warnings.push(...detail.warnings);

    const yieldQuantity = subRecipe.yieldQuantity && subRecipe.yieldQuantity > 0 ? subRecipe.yieldQuantity : 1;
    const costPerYieldUnit = detail.finalCost / yieldQuantity;
    subrecipeCost += sub.quantityNeeded * costPerYieldUnit;
  }

  // 3) Packaging: cantidad × coste unitario.
  const packagingCost = (recipe.packaging ?? []).reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const baseCost = ingredientCost + subrecipeCost + packagingCost;
  const safetyMarginPercent = Math.max(0, recipe.safetyMarginPercent ?? 0);
  const safetyMarginAmount = baseCost * (safetyMarginPercent / 100);
  const finalCost = baseCost + safetyMarginAmount;

  const yieldQuantity = recipe.yieldQuantity && recipe.yieldQuantity > 0 ? recipe.yieldQuantity : 1;
  const costPerServing = finalCost / yieldQuantity;

  return {
    ingredientCost,
    subrecipeCost,
    packagingCost,
    baseCost,
    safetyMarginAmount,
    finalCost,
    costPerServing,
    warnings,
  };
}

// Precio sugerido con IVA para alcanzar el food cost objetivo después de comisiones.
// Modelo del análisis (§27): P = C / (F × (1 - comisión)) para comisión porcentual.
export function suggestedPriceWithTax(
  costPerServing: number,
  targetFoodCostPercent: number,
  channel: Channel,
  taxRate: number
): number {
  const target = targetFoodCostPercent / 100;
  if (!(target > 0)) return 0;

  let priceWithoutTax: number;
  if (channel.commissionType === 'percentage') {
    const rate = channel.commissionValue / 100;
    if (rate >= 1) return 0; // comisión >= 100% no permite alcanzar el objetivo
    priceWithoutTax = costPerServing / (target * (1 - rate));
  } else {
    priceWithoutTax = costPerServing / target + channel.commissionValue;
  }

  return priceWithoutTax * (1 + taxRate / 100);
}

// Comisión del canal sobre el precio sin IVA.
export function channelCommission(priceWithoutTax: number, channel: Channel): number {
  if (channel.commissionType === 'percentage') {
    return priceWithoutTax * (channel.commissionValue / 100);
  }
  return channel.commissionValue;
}

export function analyzeDish(dish: Dish, allIngredients: Ingredient[], allRecipes: Dish[] = []): CostAnalysis {
  const warnings: string[] = [];
  const detail = calculateRecipeCost(dish, allIngredients, allRecipes);
  warnings.push(...detail.warnings);

  const taxRate = Math.max(0, dish.taxRate ?? DEFAULT_TAX_RATE);
  const targetFoodCostPercent = Math.max(0, dish.targetFoodCostPercent ?? DEFAULT_TARGET_FOOD_COST);

  const priceWithoutTax = dish.sellingPrice / (1 + taxRate / 100);

  // Canales del plato, o los canales por defecto con el PVP base si no define ninguno.
  const selectedChannels =
    dish.channels && dish.channels.length > 0
      ? dish.channels
      : DEFAULT_CHANNELS.map((channel) => ({ channelId: channel.id, priceWithTax: dish.sellingPrice }));

  const channels: ChannelAnalysis[] = selectedChannels.map((dishChannel) => {
    const channel =
      DEFAULT_CHANNELS.find((c) => c.id === dishChannel.channelId) ??
      ({ id: dishChannel.channelId, name: dishChannel.channelId, commissionType: 'percentage', commissionValue: 0 } as Channel);

    const priceWithTax = dishChannel.priceWithTax;
    const priceWithout = priceWithTax / (1 + taxRate / 100);
    const commission = channelCommission(priceWithout, channel);
    const grossMargin = priceWithout - commission - detail.costPerServing;
    const grossMarginPercent = priceWithout > 0 ? (grossMargin / priceWithout) * 100 : 0;
    const foodCostPercent =
      priceWithout - commission > 0 ? (detail.costPerServing / (priceWithout - commission)) * 100 : 0;
    const suggested = suggestedPriceWithTax(detail.costPerServing, targetFoodCostPercent, channel, taxRate);

    if (channel.commissionType === 'percentage' && channel.commissionValue >= 100) {
      warnings.push(`El canal "${channel.name}" tiene comisión del ${channel.commissionValue}%: no es sostenible.`);
    }

    return {
      channelId: channel.id,
      channelName: channel.name,
      priceWithTax,
      priceWithoutTax: priceWithout,
      commission,
      cost: detail.costPerServing,
      grossMargin,
      grossMarginPercent,
      foodCostPercent,
      suggestedPriceWithTax: suggested,
    };
  });

  // El canal principal (el primero) mantiene compatibilidad con las tarjetas y KPIs.
  const primary = channels[0];
  const margin = primary ? primary.grossMargin : priceWithoutTax - detail.costPerServing;
  const marginPercentage = primary
    ? primary.grossMarginPercent
    : priceWithoutTax > 0
      ? (margin / priceWithoutTax) * 100
      : 0;

  return {
    dishId: dish.id,
    dishName: dish.name,
    ingredientCost: detail.ingredientCost,
    subrecipeCost: detail.subrecipeCost,
    packagingCost: detail.packagingCost,
    baseCost: detail.baseCost,
    safetyMarginPercent: Math.max(0, dish.safetyMarginPercent ?? 0),
    totalCost: detail.finalCost,
    costPerServing: detail.costPerServing,
    yieldQuantity: dish.yieldQuantity && dish.yieldQuantity > 0 ? dish.yieldQuantity : 1,
    sellingPrice: dish.sellingPrice,
    priceWithoutTax,
    taxRate,
    targetFoodCostPercent,
    channels,
    margin,
    marginPercentage,
    warnings,
  };
}

// Detalle línea por línea de una receta, para la ficha técnica y el "Detalle del
// costeo" (§11 del análisis). Reproduce las mismas fórmulas del motor, pero conserva
// el desglose de cada componente en lugar de solo los totales.
export interface BreakdownLine {
  name: string;
  netQuantity: number;
  unit: UnitType; // unidad elegida en la receta
  wastePercent: number;
  grossQuantity: number; // cantidad bruta en la unidad de la receta
  cost: number;
  // Consumo equivalente en la unidad de inventario del producto (para descontar stock).
  stockUnit?: UnitType;
  grossInStockUnit?: number;
}

export interface RecipeBreakdown {
  ingredients: BreakdownLine[];
  subrecipes: BreakdownLine[];
  packaging: BreakdownLine[];
  detail: RecipeCostDetail;
}

export function recipeBreakdown(
  recipe: Dish,
  allIngredients: Ingredient[],
  allRecipes: Dish[] = []
): RecipeBreakdown {
  const ingredients: BreakdownLine[] = [];
  for (const item of recipe.ingredients ?? []) {
    const ingredient = allIngredients.find((ing) => ing.id === item.ingredientId);
    if (!ingredient) continue;
    const waste = item.wastePercent ?? 0;
    if (waste >= 100) continue;
    const recipeUnit =
      item.unit && UNIT_DIMENSION[item.unit] === UNIT_DIMENSION[ingredient.unitType]
        ? item.unit
        : ingredient.unitType;
    const gross = grossQuantity(item.quantityNeeded, waste);
    const costPerBaseUnit = ingredient.costPerUnit / UNIT_FACTOR[ingredient.unitType];
    const cost = toBaseQuantity(gross, recipeUnit) * costPerBaseUnit;
    ingredients.push({
      name: ingredient.name,
      netQuantity: item.quantityNeeded,
      unit: recipeUnit,
      wastePercent: waste,
      grossQuantity: gross,
      cost,
      stockUnit: ingredient.unitType,
      grossInStockUnit: convertQuantity(gross, recipeUnit, ingredient.unitType),
    });
  }

  const subrecipes: BreakdownLine[] = [];
  for (const sub of recipe.subrecipes ?? []) {
    const subRecipe = allRecipes.find((r) => r.id === sub.recipeId);
    if (!subRecipe) continue;
    const subDetail = calculateRecipeCost(subRecipe, allIngredients, allRecipes, new Set([recipe.id]));
    const yieldQuantity = subRecipe.yieldQuantity && subRecipe.yieldQuantity > 0 ? subRecipe.yieldQuantity : 1;
    const costPerYieldUnit = subDetail.finalCost / yieldQuantity;
    subrecipes.push({
      name: subRecipe.name,
      netQuantity: sub.quantityNeeded,
      unit: subRecipe.yieldUnit ?? 'unit',
      wastePercent: 0,
      grossQuantity: sub.quantityNeeded,
      cost: sub.quantityNeeded * costPerYieldUnit,
    });
  }

  const packaging: BreakdownLine[] = (recipe.packaging ?? []).map((item) => ({
    name: item.name,
    netQuantity: item.quantity,
    unit: item.unit,
    wastePercent: 0,
    grossQuantity: item.quantity,
    cost: item.quantity * item.unitCost,
  }));

  return {
    ingredients,
    subrecipes,
    packaging,
    detail: calculateRecipeCost(recipe, allIngredients, allRecipes),
  };
}

export function marginStatus(marginPercentage: number): MarginStatus {
  if (marginPercentage > MARGIN_OPTIMAL) return 'optimal';
  if (marginPercentage > MARGIN_REVIEW) return 'review';
  return 'critical';
}

export const MARGIN_BADGE: Record<MarginStatus, { label: string }> = {
  optimal: { label: 'Óptimo' },
  review: { label: 'Revisar' },
  critical: { label: 'Crítico' },
};
