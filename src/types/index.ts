export type UserRole = 'admin' | 'chef' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

// Cada hotel tiene restaurante y bar; cada área compra, guarda stock y costea por separado.
export type Area = 'restaurant' | 'bar';

export interface Hotel {
  id: string;
  name: string;
}

// Masa: kg, g, lb, oz · Volumen: l, ml, cl · Conteo: unit (pz).
export type UnitType = 'kg' | 'g' | 'lb' | 'oz' | 'l' | 'ml' | 'cl' | 'unit';

// Los 14 alérgenos de declaración obligatoria (UE). Se guardan en el producto y se
// agregan a la receta automáticamente desde sus ingredientes y subrecetas.
export type Allergen =
  | 'gluten'
  | 'crustaceos'
  | 'huevos'
  | 'pescado'
  | 'cacahuetes'
  | 'soja'
  | 'lacteos'
  | 'frutos_secos'
  | 'apio'
  | 'mostaza'
  | 'sesamo'
  | 'sulfitos'
  | 'altramuces'
  | 'moluscos';

export interface Ingredient {
  id: string;
  hotelId: string;
  area: Area;
  name: string;
  unitType: UnitType;
  costPerUnit: number; // costo promedio ponderado de las compras
  currentStock: number;
  minStock: number;
  lastUpdated: string;
  allergens?: Allergen[]; // alérgenos que aporta este producto
  category?: string; // grupo/familia para ordenar el inventario (ej. Carnes, Lácteos)
  supplier?: string; // proveedor habitual
  // Coste de referencia: el costo que se considera "normal". Sirve para medir la
  // desviación del promedio ponderado actual (subidas de proveedor) y se actualiza
  // cuando el usuario "acepta" el coste nuevo. Por defecto, el costo inicial.
  referenceCost?: number;
}

// compra y ajuste pueden subir el stock; consumo y merma lo bajan.
export type MovementType = 'purchase' | 'consumption' | 'waste' | 'adjustment';

export interface StockMovement {
  id: string;
  ingredientId: string;
  type: MovementType;
  quantity: number; // con signo: positivo entra, negativo sale
  unitCost: number; // costo unitario al momento del movimiento
  stockAfter: number;
  date: string; // ISO
  note?: string;
  userName: string;
}

// Cantidad neta que lleva la receta. La merma se aplica para obtener la cantidad
// bruta a comprar: cantidad_bruta = cantidad_neta / (1 - merma).
export interface DishIngredient {
  ingredientId: string;
  quantityNeeded: number;
  // Unidad en la que se expresa la cantidad de la receta. Puede diferir de la unidad
  // de inventario del producto siempre que sea de la misma dimensión (ej: producto en
  // lb, receta en oz). El motor convierte para costear y descontar stock. Por defecto,
  // la unidad del producto.
  unit?: UnitType;
  wastePercent?: number; // 0-100, por defecto 0
}

// Una receta puede incluir otra receta (subreceta). La cantidad se expresa en la
// unidad de rendimiento de la subreceta (ej: 0.05 kg de "Salsa de la casa").
export interface DishSubrecipe {
  recipeId: string;
  quantityNeeded: number;
}

// Envases, bolsas, cajas y consumibles que forman parte del coste de servir el plato.
export interface PackagingItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  unitCost: number;
}

export type CommissionType = 'percentage' | 'fixed';

export interface Channel {
  id: string;
  name: string;
  commissionType: CommissionType;
  commissionValue: number; // % cuando es porcentual; monto cuando es fija
  description?: string;
}

// Precio específico de un plato en un canal. Si un plato no define canales,
// el motor usa los canales por defecto con su PVP base.
export interface DishChannel {
  channelId: string;
  priceWithTax: number;
}

export interface Dish {
  id: string;
  hotelId: string;
  area: Area;
  name: string;
  sellingPrice: number; // PVP con IVA base
  ingredients: DishIngredient[];
  description?: string;
  code?: string;
  category?: string;
  taxRate?: number; // IVA % (por defecto 8.25)
  targetFoodCostPercent?: number; // objetivo de food cost % (por defecto 30)
  yieldQuantity?: number; // cuántas porciones/unidades rinde (por defecto 1)
  yieldUnit?: UnitType; // unidad de rendimiento (por defecto 'unit')
  safetyMarginPercent?: number; // margen de seguridad sobre el coste base (por defecto 0)
  subrecipes?: DishSubrecipe[];
  packaging?: PackagingItem[];
  channels?: DishChannel[];
  // Alérgenos añadidos manualmente a esta elaboración (los de ingredientes y subrecetas
  // se calculan solos; aquí solo van los que correspondan directamente a la receta).
  allergens?: Allergen[];
  // Receta interna que no se vende (ej. una salsa) y no aparece en la carta.
  isSubrecipe?: boolean;
  // Pasos de elaboración (uno por elemento) para la ficha técnica de cocina.
  preparationSteps?: string[];
  // URL de la foto del plato (la app es solo frontend: se referencia por URL).
  imageUrl?: string;
}

export interface ChannelAnalysis {
  channelId: string;
  channelName: string;
  priceWithTax: number;
  priceWithoutTax: number;
  commission: number;
  cost: number; // coste por porción
  grossMargin: number;
  grossMarginPercent: number;
  foodCostPercent: number; // coste / (precio sin IVA - comisión)
  suggestedPriceWithTax: number;
}

export interface CostAnalysis {
  dishId: string;
  dishName: string;
  ingredientCost: number;
  subrecipeCost: number;
  packagingCost: number;
  baseCost: number;
  safetyMarginPercent: number;
  totalCost: number; // coste final de la receta completa
  costPerServing: number; // coste por porción
  yieldQuantity: number;
  sellingPrice: number; // PVP con IVA base
  priceWithoutTax: number;
  taxRate: number;
  targetFoodCostPercent: number;
  channels: ChannelAnalysis[];
  margin: number; // margen bruto del canal principal
  marginPercentage: number; // % margen bruto del canal principal
  warnings: string[];
}

// Menú único: la app se enfoca en inventario y su costeo. Un solo acceso para todos.
export const MENU: MenuItem[] = [
  { id: 'inventario', label: 'Inventario', href: '/inventario', icon: 'Package' },
  { id: 'platos', label: 'Platos', href: '/platos', icon: 'UtensilsCrossed' },
  { id: 'costeo', label: 'Costeo', href: '/costeo', icon: 'DollarSign' },
];
