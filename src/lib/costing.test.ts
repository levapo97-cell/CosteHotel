import { describe, expect, it } from 'vitest';
import { Channel, Dish, Ingredient } from '@/types';
import {
  analyzeDish,
  calculateRecipeCost,
  channelCommission,
  compatibleUnits,
  convertQuantity,
  grossQuantity,
  recipeBreakdown,
  suggestedPriceWithTax,
} from '@/lib/costing';

// Ingrediente base para los escenarios: carne a $10/kg.
const carne = (over: Partial<Ingredient> = {}): Ingredient => ({
  id: 'carne',
  hotelId: 'h1',
  area: 'restaurant',
  name: 'Carne molida 80/20',
  unitType: 'kg',
  costPerUnit: 10,
  currentStock: 10,
  minStock: 1,
  lastUpdated: '2026-09-15',
  ...over,
});

const burger = (over: Partial<Dish> = {}): Dish => ({
  id: 'burger',
  hotelId: 'h1',
  area: 'restaurant',
  name: 'Hamburguesa',
  sellingPrice: 14,
  taxRate: 8.25,
  targetFoodCostPercent: 30,
  yieldQuantity: 1,
  yieldUnit: 'unit',
  safetyMarginPercent: 10,
  ingredients: [{ ingredientId: 'carne', quantityNeeded: 0.18, wastePercent: 10 }],
  packaging: [{ id: 'p1', name: 'Caja', quantity: 1, unit: 'unit', unitCost: 0.89 }],
  ...over,
});

describe('cantidad bruta (§6, §32)', () => {
  it('180 g netos con 10% de merma dan 200 g brutos', () => {
    expect(grossQuantity(180, 10)).toBeCloseTo(200, 6);
  });

  it('sin merma, la bruta es igual a la neta', () => {
    expect(grossQuantity(180, 0)).toBe(180);
  });

  it('acota la merma para evitar división entre cero (§43)', () => {
    expect(Number.isFinite(grossQuantity(100, 100))).toBe(true);
  });
});

describe('coste de la receta (§11-§14, §32)', () => {
  it('aplica merma: 0.18 kg netos al 10% cuestan 0.2 kg × $10 = $2.00', () => {
    const detail = calculateRecipeCost(burger({ packaging: [] }), [carne()], []);
    expect(detail.ingredientCost).toBeCloseTo(2, 6);
  });

  it('suma empaque y aplica el margen de seguridad al coste base', () => {
    const detail = calculateRecipeCost(burger(), [carne()], []);
    expect(detail.packagingCost).toBeCloseTo(0.89, 6);
    expect(detail.baseCost).toBeCloseTo(2.89, 6);
    // coste final = base × (1 + margen) = 2.89 × 1.10
    expect(detail.finalCost).toBeCloseTo(3.179, 6);
    expect(detail.costPerServing).toBeCloseTo(3.179, 6);
  });

  it('divide el coste final entre el rendimiento (§14, §15)', () => {
    const detail = calculateRecipeCost(burger({ yieldQuantity: 10 }), [carne()], []);
    expect(detail.costPerServing).toBeCloseTo(3.179 / 10, 6);
  });

  it('el desglose por línea reproduce el coste del motor', () => {
    const breakdown = recipeBreakdown(burger(), [carne()], []);
    expect(breakdown.ingredients[0].grossQuantity).toBeCloseTo(0.2, 6);
    expect(breakdown.ingredients[0].cost).toBeCloseTo(2, 6);
    expect(breakdown.packaging[0].cost).toBeCloseTo(0.89, 6);
    expect(breakdown.detail.finalCost).toBeCloseTo(3.179, 6);
  });
});

describe('precio, IVA y margen por canal (§16, §20, §21)', () => {
  it('precio sin IVA = precio con IVA / (1 + IVA): 14 / 1.0825 ≈ 12.93', () => {
    const analysis = analyzeDish(burger(), [carne()], []);
    expect(analysis.priceWithoutTax).toBeCloseTo(12.93, 2);
  });

  it('margen bruto = precio sin IVA − comisión − coste', () => {
    const analysis = analyzeDish(burger(), [carne()], []);
    const local = analysis.channels[0];
    expect(local.grossMargin).toBeCloseTo(local.priceWithoutTax - local.commission - local.cost, 6);
    expect(local.grossMarginPercent).toBeCloseTo((local.grossMargin / local.priceWithoutTax) * 100, 6);
  });
});

describe('comisión del canal (§22, §23)', () => {
  const pct: Channel = { id: 'uber', name: 'Uber', commissionType: 'percentage', commissionValue: 25 };
  const fixed: Channel = { id: 'x', name: 'Fija', commissionType: 'fixed', commissionValue: 1.5 };

  it('porcentual: 25% de $12.93', () => {
    expect(channelCommission(12.93, pct)).toBeCloseTo(3.2325, 6);
  });

  it('fija: monto constante independiente del precio', () => {
    expect(channelCommission(12.93, fixed)).toBe(1.5);
    expect(channelCommission(100, fixed)).toBe(1.5);
  });
});

describe('precio sugerido por food cost (§27)', () => {
  it('P = C / (F × (1 − comisión)) × (1 + IVA); sin comisión ni IVA, C/F', () => {
    const channel: Channel = { id: 'local', name: 'Local', commissionType: 'percentage', commissionValue: 0 };
    expect(suggestedPriceWithTax(3, 30, channel, 0)).toBeCloseTo(10, 6); // 3 / 0.3
  });

  it('comisión ≥ 100% no permite alcanzar el objetivo', () => {
    const channel: Channel = { id: 'x', name: 'X', commissionType: 'percentage', commissionValue: 100 };
    expect(suggestedPriceWithTax(3, 30, channel, 0)).toBe(0);
  });
});

describe('conversión de unidades (§7): inventario y receta en unidades distintas', () => {
  it('1 lb = 16 oz y 16 oz = 1 lb', () => {
    expect(convertQuantity(1, 'lb', 'oz')).toBeCloseTo(16, 6);
    expect(convertQuantity(16, 'oz', 'lb')).toBeCloseTo(1, 6);
  });

  it('1 kg = 1000 g', () => {
    expect(convertQuantity(1, 'kg', 'g')).toBeCloseTo(1000, 6);
  });

  it('solo permite elegir unidades de la misma dimensión', () => {
    const mass = compatibleUnits('lb');
    expect(mass).toEqual(expect.arrayContaining(['kg', 'g', 'lb', 'oz']));
    expect(mass).not.toContain('ml');
    expect(mass).not.toContain('unit');
  });

  it('no convierte entre dimensiones distintas (deja la cantidad igual)', () => {
    expect(convertQuantity(5, 'kg', 'ml')).toBe(5);
  });

  it('costea convirtiendo: producto en lb a $10, receta usa 8 oz (media libra) = $5.00', () => {
    const harina = carne({ id: 'harina', name: 'Harina', unitType: 'lb', costPerUnit: 10 });
    const dish = burger({
      ingredients: [{ ingredientId: 'harina', quantityNeeded: 8, unit: 'oz', wastePercent: 0 }],
      packaging: [],
      safetyMarginPercent: 0,
    });
    const detail = calculateRecipeCost(dish, [harina], []);
    expect(detail.ingredientCost).toBeCloseTo(5, 4);
  });

  it('el desglose reporta el consumo equivalente en la unidad de inventario', () => {
    const harina = carne({ id: 'harina', name: 'Harina', unitType: 'lb', costPerUnit: 10 });
    const dish = burger({
      ingredients: [{ ingredientId: 'harina', quantityNeeded: 8, unit: 'oz', wastePercent: 0 }],
      packaging: [],
    });
    const line = recipeBreakdown(dish, [harina], []).ingredients[0];
    expect(line.unit).toBe('oz');
    expect(line.grossInStockUnit).toBeCloseTo(0.5, 4); // 8 oz = 0.5 lb
  });
});

describe('casos límite (§43)', () => {
  it('merma ≥ 100% descarta el ingrediente y avisa', () => {
    const detail = calculateRecipeCost(
      burger({ ingredients: [{ ingredientId: 'carne', quantityNeeded: 0.18, wastePercent: 100 }], packaging: [] }),
      [carne()],
      []
    );
    expect(detail.ingredientCost).toBe(0);
    expect(detail.warnings.some((w) => w.includes('merma'))).toBe(true);
  });

  it('detecta recetas circulares sin colgarse (A → B → A)', () => {
    const a = burger({ id: 'A', ingredients: [], packaging: [], subrecipes: [{ recipeId: 'B', quantityNeeded: 1 }] });
    const b = burger({ id: 'B', ingredients: [], packaging: [], subrecipes: [{ recipeId: 'A', quantityNeeded: 1 }] });
    const detail = calculateRecipeCost(a, [carne()], [a, b]);
    expect(detail.warnings.some((w) => w.toLowerCase().includes('circular'))).toBe(true);
  });
});
