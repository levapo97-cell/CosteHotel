import { create } from 'zustand';
import { Area, Dish, Ingredient, MovementType, StockMovement, UnitType } from '@/types';

const round = (value: number, decimals = 3) => Math.round(value * 10 ** decimals) / 10 ** decimals;
const today = () => new Date().toISOString().split('T')[0];

type Seed = [id: string, hotelId: string, area: Area, name: string, unit: UnitType, cost: number, stock: number, min: number];

const SEED: Seed[] = [
  ['r1', 'h1', 'restaurant', 'Pechuga de Pollo', 'kg', 8.5, 15, 5],
  ['r2', 'h1', 'restaurant', 'Arroz Blanco', 'kg', 2.2, 45, 10],
  ['r3', 'h1', 'restaurant', 'Tomate Fresco', 'kg', 1.8, 4, 6],
  ['r4', 'h1', 'restaurant', 'Aceite de Oliva', 'l', 12, 8, 2],
  ['b1', 'h1', 'bar', 'Ron Blanco', 'l', 18, 6, 2],
  ['b2', 'h1', 'bar', 'Limón', 'kg', 2.5, 3, 1],
  ['b3', 'h1', 'bar', 'Azúcar', 'kg', 1.2, 5, 1],
  ['b4', 'h1', 'bar', 'Hierbabuena', 'g', 0.02, 300, 100],
  ['b5', 'h1', 'bar', 'Gaseosa Cola 355 ml', 'unit', 0.8, 10, 12],
  ['r5', 'h2', 'restaurant', 'Pescado Corvina', 'kg', 14, 10, 4],
  ['r6', 'h2', 'restaurant', 'Limón', 'kg', 2.3, 6, 2],
  ['r7', 'h2', 'restaurant', 'Cebolla Roja', 'kg', 1.5, 8, 3],
  ['b6', 'h2', 'bar', 'Pisco', 'l', 22, 4, 2],
  ['b7', 'h2', 'bar', 'Limón', 'kg', 2.3, 2, 1],
  ['b8', 'h2', 'bar', 'Jarabe de Goma', 'l', 5, 1.5, 0.5],
];

const DEMO_INGREDIENTS: Ingredient[] = SEED.map(([id, hotelId, area, name, unitType, costPerUnit, currentStock, minStock]) => ({
  id, hotelId, area, name, unitType, costPerUnit, currentStock, minStock, lastUpdated: '2026-09-15',
}));

const DEMO_MOVEMENTS: StockMovement[] = DEMO_INGREDIENTS.map((ing) => ({
  id: `m-${ing.id}`,
  ingredientId: ing.id,
  type: 'adjustment',
  quantity: ing.currentStock,
  unitCost: ing.costPerUnit,
  stockAfter: ing.currentStock,
  date: '2026-09-15T08:00:00.000Z',
  note: 'Stock inicial',
  userName: 'Sistema',
}));

const DEMO_DISHES: Dish[] = [
  {
    id: 'd1', hotelId: 'h1', area: 'restaurant', name: 'Pollo a la Grilla', sellingPrice: 25,
    description: 'Pechuga de pollo a la parrilla con arroz',
    ingredients: [{ ingredientId: 'r1', quantityNeeded: 0.3 }, { ingredientId: 'r2', quantityNeeded: 0.2 }],
  },
  {
    id: 'd2', hotelId: 'h1', area: 'restaurant', name: 'Ensalada de Tomate y Pollo', sellingPrice: 18,
    description: 'Ensalada fresca con pollo desmenuzado',
    ingredients: [
      { ingredientId: 'r1', quantityNeeded: 0.25 },
      { ingredientId: 'r3', quantityNeeded: 0.15 },
      { ingredientId: 'r4', quantityNeeded: 0.02 },
    ],
  },
  {
    id: 'd3', hotelId: 'h1', area: 'restaurant', name: 'Arroz con Pollo', sellingPrice: 22,
    ingredients: [{ ingredientId: 'r1', quantityNeeded: 0.35 }, { ingredientId: 'r2', quantityNeeded: 0.4 }],
  },
  {
    id: 'd4', hotelId: 'h1', area: 'bar', name: 'Mojito', sellingPrice: 9,
    ingredients: [
      { ingredientId: 'b1', quantityNeeded: 0.06 },
      { ingredientId: 'b2', quantityNeeded: 0.04 },
      { ingredientId: 'b3', quantityNeeded: 0.02 },
      { ingredientId: 'b4', quantityNeeded: 8 },
    ],
  },
  {
    id: 'd5', hotelId: 'h1', area: 'bar', name: 'Cuba Libre', sellingPrice: 7,
    ingredients: [{ ingredientId: 'b1', quantityNeeded: 0.06 }, { ingredientId: 'b5', quantityNeeded: 1 }],
  },
  {
    id: 'd6', hotelId: 'h2', area: 'restaurant', name: 'Ceviche de Corvina', sellingPrice: 28,
    ingredients: [
      { ingredientId: 'r5', quantityNeeded: 0.25 },
      { ingredientId: 'r6', quantityNeeded: 0.1 },
      { ingredientId: 'r7', quantityNeeded: 0.05 },
    ],
  },
  {
    id: 'd7', hotelId: 'h2', area: 'bar', name: 'Pisco Sour', sellingPrice: 10,
    ingredients: [
      { ingredientId: 'b6', quantityNeeded: 0.09 },
      { ingredientId: 'b7', quantityNeeded: 0.03 },
      { ingredientId: 'b8', quantityNeeded: 0.02 },
    ],
  },
];

export interface NewProductInput {
  hotelId: string;
  area: Area;
  name: string;
  unitType: UnitType;
  costPerUnit: number;
  initialStock: number;
  minStock: number;
}

export interface MovementInput {
  ingredientId: string;
  type: MovementType;
  quantity: number; // en ajuste es el stock contado, no la diferencia
  unitCost?: number; // solo compras
  note?: string;
}

export type DishInput = Omit<Dish, 'id'>;

interface InventoryState {
  ingredients: Ingredient[];
  movements: StockMovement[];
  dishes: Dish[];
  addProduct: (input: NewProductInput, userName: string) => void;
  updateProduct: (id: string, changes: Pick<Ingredient, 'name' | 'minStock'>) => void;
  deleteProduct: (id: string) => void;
  registerMovement: (input: MovementInput, userName: string) => void;
  saveDish: (input: DishInput, id?: string) => void;
  deleteDish: (id: string) => void;
}

// Estado en memoria: sobrevive al cambio de página pero se reinicia al recargar.
export const useInventoryStore = create<InventoryState>((set) => ({
  ingredients: DEMO_INGREDIENTS,
  movements: DEMO_MOVEMENTS,
  dishes: DEMO_DISHES,

  addProduct: ({ initialStock, ...input }, userName) =>
    set((state) => {
      const ingredient: Ingredient = { ...input, id: crypto.randomUUID(), currentStock: initialStock, lastUpdated: today() };
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        ingredientId: ingredient.id,
        type: 'adjustment',
        quantity: initialStock,
        unitCost: input.costPerUnit,
        stockAfter: initialStock,
        date: new Date().toISOString(),
        note: 'Stock inicial',
        userName,
      };
      return { ingredients: [...state.ingredients, ingredient], movements: [movement, ...state.movements] };
    }),

  updateProduct: (id, changes) =>
    set((state) => ({
      ingredients: state.ingredients.map((ing) => (ing.id === id ? { ...ing, ...changes } : ing)),
    })),

  // Un producto usado en alguna receta no se borra: dejaría costos incompletos.
  deleteProduct: (id) =>
    set((state) =>
      state.dishes.some((dish) => dish.ingredients.some((item) => item.ingredientId === id))
        ? state
        : {
            ingredients: state.ingredients.filter((ing) => ing.id !== id),
            movements: state.movements.filter((mov) => mov.ingredientId !== id),
          }
    ),

  registerMovement: ({ ingredientId, type, quantity, unitCost, note }, userName) =>
    set((state) => {
      const ingredient = state.ingredients.find((ing) => ing.id === ingredientId);
      if (!ingredient) return state;

      const stock = ingredient.currentStock;
      let delta: number;
      let costPerUnit = ingredient.costPerUnit;

      if (type === 'purchase') {
        delta = quantity;
        // Promedio ponderado: el costo nuevo refleja lo que había y lo que se compró.
        costPerUnit = stock > 0 ? (stock * ingredient.costPerUnit + quantity * unitCost!) / (stock + quantity) : unitCost!;
      } else if (type === 'adjustment') {
        delta = quantity - stock;
      } else {
        delta = -Math.min(quantity, stock);
      }

      const stockAfter = round(stock + delta);
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        ingredientId,
        type,
        quantity: round(delta),
        unitCost: type === 'purchase' ? unitCost! : ingredient.costPerUnit,
        stockAfter,
        date: new Date().toISOString(),
        note,
        userName,
      };

      return {
        ingredients: state.ingredients.map((ing) =>
          ing.id === ingredientId
            ? { ...ing, currentStock: stockAfter, costPerUnit: round(costPerUnit, 4), lastUpdated: today() }
            : ing
        ),
        movements: [movement, ...state.movements],
      };
    }),

  saveDish: (input, id) =>
    set((state) => ({
      dishes: id
        ? state.dishes.map((dish) => (dish.id === id ? { ...input, id } : dish))
        : [...state.dishes, { ...input, id: crypto.randomUUID() }],
    })),

  deleteDish: (id) => set((state) => ({ dishes: state.dishes.filter((dish) => dish.id !== id) })),
}));
