'use client';

import { FormEvent, useId, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Allergen, Area, Dish, Ingredient, UnitType } from '@/types';
import { DishInput } from '@/store/inventoryStore';
import { autoAllergens } from '@/lib/allergens';
import { AllergenPicker } from '@/components/ui/AllergenPicker';
import {
  DEFAULT_CHANNELS,
  DEFAULT_TARGET_FOOD_COST,
  DEFAULT_TAX_RATE,
  UNIT_LABELS,
  analyzeDish,
  compatibleUnits,
  convertQuantity,
  formatMoney,
  ingredientLineCost,
} from '@/lib/costing';
import { AREA_COPY } from '@/lib/inventory';
import { Field, InfoNote, Select, inputClass } from '@/components/ui/Form';
import { buttonClass } from '@/components/ui/Button';
import { formatPercent } from '@/components/ui/format';
import { marginTone } from '@/components/ui/tone';
import { ChannelList } from '@/components/Costeo/ChannelComparison';

// Cada fila tiene su propia `key` estable para que React no confunda filas al quitar una.
interface IngredientRow {
  key: string;
  ingredientId: string;
  quantity: string;
  unit: string; // UnitType elegido para la receta (puede diferir del de inventario)
  waste: string;
}

interface SubrecipeRow {
  key: string;
  recipeId: string;
  quantity: string;
}

interface PackagingRow {
  key: string;
  name: string;
  quantity: string;
  unit: UnitType;
  unitCost: string;
}

interface ChannelRow {
  key: string;
  channelId: string;
  enabled: boolean;
  price: string;
}

type Errors = Partial<
  Record<'name' | 'sellingPrice' | 'taxRate' | 'targetFoodCost' | 'yieldQuantity' | 'safetyMargin' | 'ingredients' | 'subrecipes' | 'packaging' | 'channels', string>
>;

interface DishFormProps {
  formId: string;
  initial?: Dish;
  ingredients: Ingredient[];
  recipes: Dish[];
  area: Area;
  onSubmit: (input: Omit<DishInput, 'hotelId' | 'area'>) => void;
}

const uid = () => crypto.randomUUID();

const newIngredientRow = (ingredientId = '', quantity = '', waste = '0', unit = ''): IngredientRow => ({
  key: uid(),
  ingredientId,
  quantity,
  unit,
  waste,
});
const newSubrecipeRow = (recipeId = '', quantity = ''): SubrecipeRow => ({ key: uid(), recipeId, quantity });
const newPackagingRow = (name = '', quantity = '1', unit: UnitType = 'unit', unitCost = ''): PackagingRow => ({
  key: uid(),
  name,
  quantity,
  unit,
  unitCost,
});

const UNITS: UnitType[] = ['g', 'kg', 'lb', 'oz', 'ml', 'cl', 'l', 'unit'];

export function DishForm({ formId, initial, ingredients, recipes, area, onSubmit }: DishFormProps) {
  const id = useId();
  const copy = AREA_COPY[area];

  const [name, setName] = useState(initial?.name ?? '');
  const [code, setCode] = useState(initial?.code ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [steps, setSteps] = useState((initial?.preparationSteps ?? []).join('\n'));
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [sellingPrice, setSellingPrice] = useState(initial?.sellingPrice.toString() ?? '');
  const [taxRate, setTaxRate] = useState((initial?.taxRate ?? DEFAULT_TAX_RATE).toString());
  const [targetFoodCost, setTargetFoodCost] = useState((initial?.targetFoodCostPercent ?? DEFAULT_TARGET_FOOD_COST).toString());
  const [yieldQuantity, setYieldQuantity] = useState((initial?.yieldQuantity ?? 1).toString());
  const [yieldUnit, setYieldUnit] = useState<UnitType>(initial?.yieldUnit ?? 'unit');
  const [safetyMargin, setSafetyMargin] = useState((initial?.safetyMarginPercent ?? 0).toString());

  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>(() =>
    initial
      ? initial.ingredients.map((item) =>
          newIngredientRow(
            item.ingredientId,
            item.quantityNeeded.toString(),
            (item.wastePercent ?? 0).toString(),
            item.unit ?? ingredients.find((ing) => ing.id === item.ingredientId)?.unitType ?? ''
          )
        )
      : [newIngredientRow()]
  );
  const [subrecipeRows, setSubrecipeRows] = useState<SubrecipeRow[]>(() =>
    (initial?.subrecipes ?? []).map((sub) => newSubrecipeRow(sub.recipeId, sub.quantityNeeded.toString()))
  );
  const [packagingRows, setPackagingRows] = useState<PackagingRow[]>(() =>
    (initial?.packaging ?? []).map((item) => newPackagingRow(item.name, item.quantity.toString(), item.unit, item.unitCost.toString()))
  );
  const [channelRows, setChannelRows] = useState<ChannelRow[]>(() =>
    DEFAULT_CHANNELS.map((channel) => {
      const saved = initial?.channels?.find((dc) => dc.channelId === channel.id);
      return {
        key: uid(),
        channelId: channel.id,
        enabled: initial ? (saved ? true : false) : true,
        price: saved ? saved.priceWithTax.toString() : '',
      };
    })
  );

  const [manualAllergens, setManualAllergens] = useState<Allergen[]>(initial?.allergens ?? []);
  const [submitted, setSubmitted] = useState(false);

  const updateIngredientRow = (key: string, patch: Partial<IngredientRow>) =>
    setIngredientRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const updateSubrecipeRow = (key: string, patch: Partial<SubrecipeRow>) =>
    setSubrecipeRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const updatePackagingRow = (key: string, patch: Partial<PackagingRow>) =>
    setPackagingRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const updateChannelRow = (key: string, patch: Partial<ChannelRow>) =>
    setChannelRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const price = Number(sellingPrice) || 0;
  const tax = Number(taxRate) || 0;
  const target = Number(targetFoodCost) || 0;
  const yieldQty = Number(yieldQuantity) || 0;
  const safety = Number(safetyMargin) || 0;

  const ingredientItems = ingredientRows
    .filter((row) => row.ingredientId && Number(row.quantity) > 0)
    .map((row) => {
      const productUnit = ingredients.find((ing) => ing.id === row.ingredientId)?.unitType;
      return {
        ingredientId: row.ingredientId,
        quantityNeeded: Number(row.quantity),
        unit: ((row.unit || productUnit) ?? 'unit') as UnitType,
        wastePercent: Number(row.waste) || 0,
      };
    });
  const subrecipeItems = subrecipeRows
    .filter((row) => row.recipeId && Number(row.quantity) > 0)
    .map((row) => ({ recipeId: row.recipeId, quantityNeeded: Number(row.quantity) }));
  const packagingItems = packagingRows
    .filter((row) => row.name.trim() && Number(row.quantity) > 0)
    .map((row) => ({ id: row.key, name: row.name.trim(), quantity: Number(row.quantity), unit: row.unit, unitCost: Number(row.unitCost) || 0 }));
  const channelItems = channelRows
    .filter((row) => row.enabled)
    .map((row) => ({ channelId: row.channelId, priceWithTax: Number(row.price) > 0 ? Number(row.price) : price }));

  // Alérgenos heredados en vivo de los ingredientes y subrecetas seleccionados.
  const autoDetectedAllergens = autoAllergens(
    { id: initial?.id ?? '', ingredients: ingredientItems, subrecipes: subrecipeItems },
    ingredients,
    recipes
  );

  const preview = analyzeDish(
    {
      id: initial?.id ?? '',
      hotelId: initial?.hotelId ?? '',
      area,
      name: name.trim() || 'Vista previa',
      sellingPrice: price,
      taxRate: tax,
      targetFoodCostPercent: target,
      yieldQuantity: yieldQty > 0 ? yieldQty : 1,
      yieldUnit,
      safetyMarginPercent: safety,
      ingredients: ingredientItems,
      subrecipes: subrecipeItems,
      packaging: packagingItems,
      channels: channelItems.length > 0 ? channelItems : undefined,
    },
    ingredients,
    recipes
  );

  const validation: Errors = {};
  if (!name.trim()) validation.name = `Escribe el nombre ${copy.ofRecipe}.`;
  if (!(price > 0)) validation.sellingPrice = 'El precio debe ser mayor a 0.';
  if (tax < 0) validation.taxRate = 'El IVA no puede ser negativo.';
  if (!(target > 0) || target >= 100) validation.targetFoodCost = 'El objetivo debe estar entre 0 y 100.';
  if (!(yieldQty > 0)) validation.yieldQuantity = 'El rendimiento debe ser mayor a 0.';
  if (safety < 0 || safety >= 100) validation.safetyMargin = 'Debe estar entre 0 y 100.';

  if (ingredientItems.length === 0 && subrecipeItems.length === 0 && packagingItems.length === 0) {
    validation.ingredients = 'Agrega al menos un ingrediente, subreceta o empaque.';
  } else if (ingredientRows.some((row) => (row.ingredientId || row.quantity) && (!row.ingredientId || !(Number(row.quantity) > 0)))) {
    validation.ingredients = 'Cada fila necesita un ingrediente y una cantidad mayor a 0.';
  }
  if (ingredientRows.some((row) => Number(row.waste) >= 100)) {
    validation.ingredients = 'La merma debe ser menor al 100% (genera división entre cero).';
  }
  if (subrecipeRows.some((row) => row.recipeId === initial?.id)) {
    validation.subrecipes = 'Una receta no puede incluirse a sí misma como subreceta.';
  } else if (subrecipeRows.some((row) => row.recipeId && !(Number(row.quantity) > 0))) {
    validation.subrecipes = 'Cada subreceta necesita una cantidad mayor a 0.';
  }
  if (packagingRows.some((row) => (row.name.trim() || row.quantity) && (!row.name.trim() || !(Number(row.quantity) > 0)))) {
    validation.packaging = 'Cada empaque necesita nombre y cantidad mayor a 0.';
  }
  if (!channelRows.some((row) => row.enabled)) validation.channels = 'Selecciona al menos un canal de venta.';

  const errors = submitted ? validation : {};

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validation).length > 0) return;

    onSubmit({
      name: name.trim(),
      code: code.trim() || undefined,
      category: category.trim() || undefined,
      description: description.trim() || undefined,
      sellingPrice: price,
      taxRate: tax,
      targetFoodCostPercent: target,
      yieldQuantity: yieldQty,
      yieldUnit,
      safetyMarginPercent: safety,
      ingredients: ingredientItems,
      subrecipes: subrecipeItems,
      packaging: packagingItems,
      channels: channelItems,
      allergens: manualAllergens,
      preparationSteps: steps
        .split('\n')
        .map((step) => step.trim())
        .filter(Boolean),
      imageUrl: imageUrl.trim() || undefined,
    });
  };

  const selectedIds = new Set(ingredientRows.map((row) => row.ingredientId));
  const selectableRecipes = recipes.filter((recipe) => recipe.id !== initial?.id);

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Receta</h3>
        <Field label={`Nombre ${copy.ofRecipe}`} htmlFor={`${id}-name`} error={errors.name}>
          <input
            id={`${id}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Ej: ${copy.example}`}
            aria-invalid={!!errors.name}
            className={inputClass(errors.name)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Código (opcional)" htmlFor={`${id}-code`}>
            <input id={`${id}-code`} value={code} onChange={(e) => setCode(e.target.value)} placeholder="PRI001" className={inputClass()} />
          </Field>
          <Field label="Grupo de carta (opcional)" htmlFor={`${id}-category`}>
            <input id={`${id}-category`} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Principales" className={inputClass()} />
          </Field>
        </div>

        <Field label="Descripción (opcional)" htmlFor={`${id}-description`}>
          <textarea
            id={`${id}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Descripción ${copy.ofRecipe}`}
            rows={2}
            className={inputClass()}
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Rendimiento y margen de seguridad</h3>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Rinde" htmlFor={`${id}-yield`} error={errors.yieldQuantity}>
            <input
              id={`${id}-yield`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={yieldQuantity}
              onChange={(e) => setYieldQuantity(e.target.value)}
              placeholder="1"
              aria-invalid={!!errors.yieldQuantity}
              className={inputClass(errors.yieldQuantity)}
            />
          </Field>
          <Field label="Unidad" htmlFor={`${id}-yield-unit`}>
            <Select id={`${id}-yield-unit`} value={yieldUnit} onChange={(e) => setYieldUnit(e.target.value as UnitType)}>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {UNIT_LABELS[unit]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Margen seguridad %" htmlFor={`${id}-safety`} error={errors.safetyMargin}>
            <input
              id={`${id}-safety`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="0.1"
              value={safetyMargin}
              onChange={(e) => setSafetyMargin(e.target.value)}
              placeholder="0"
              aria-invalid={!!errors.safetyMargin}
              className={inputClass(errors.safetyMargin)}
            />
          </Field>
        </div>
        <InfoNote>
          El margen de seguridad cubre variaciones, desperdicios o costes no registrados. Se aplica al coste base:
          coste final = coste base × (1 + margen).
        </InfoNote>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Ingredientes</h3>
        <div className="space-y-2">
          {ingredientRows.map((row, index) => {
            const product = ingredients.find((ing) => ing.id === row.ingredientId);
            const productUnit = product?.unitType;
            const rowUnit = (row.unit || productUnit || '') as UnitType | '';
            const unitOptions = productUnit ? compatibleUnits(productUnit) : [];
            const qty = Number(row.quantity);
            const showConversion = !!productUnit && !!rowUnit && rowUnit !== productUnit && qty > 0;
            const lineCost = product ? ingredientLineCost(product, qty, (rowUnit || undefined) as UnitType | undefined, Number(row.waste) || 0) : 0;
            return (
              <div key={row.key} className="space-y-2 rounded-control border border-line bg-page p-2.5">
                <div className="flex items-center gap-2">
                  <Select
                    value={row.ingredientId}
                    onChange={(e) =>
                      updateIngredientRow(row.key, {
                        ingredientId: e.target.value,
                        unit: ingredients.find((ing) => ing.id === e.target.value)?.unitType ?? '',
                      })
                    }
                    aria-label={`Ingrediente ${index + 1}`}
                    className="min-w-0 flex-1"
                  >
                    <option value="">Seleccionar producto</option>
                    {ingredients.map((ing) => (
                      <option key={ing.id} value={ing.id} disabled={ing.id !== row.ingredientId && selectedIds.has(ing.id)}>
                        {ing.name}
                      </option>
                    ))}
                  </Select>
                  <button
                    type="button"
                    onClick={() => setIngredientRows((current) => current.filter((r) => r.key !== row.key))}
                    aria-label={`Quitar ingrediente ${index + 1}`}
                    className={buttonClass('icon-danger')}
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* Campos de la línea alineados como tabla: cada celda con su encabezado. */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:grid-cols-4">
                  <label className="min-w-0">
                    <span className="mb-1 block text-[11px] font-medium tracking-wide text-muted uppercase">Cantidad</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={row.quantity}
                      onChange={(e) => updateIngredientRow(row.key, { quantity: e.target.value })}
                      placeholder="0"
                      aria-label={`Cantidad del ingrediente ${index + 1}`}
                      className={inputClass()}
                    />
                  </label>
                  <label className="min-w-0">
                    <span className="mb-1 block text-[11px] font-medium tracking-wide text-muted uppercase">Unidad</span>
                    <Select
                      value={rowUnit}
                      disabled={!productUnit}
                      onChange={(e) => updateIngredientRow(row.key, { unit: e.target.value })}
                      aria-label={`Unidad del ingrediente ${index + 1}`}
                    >
                      {!productUnit && <option value="">u.</option>}
                      {unitOptions.map((u) => (
                        <option key={u} value={u}>
                          {UNIT_LABELS[u]}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="min-w-0">
                    <span className="mb-1 block text-[11px] font-medium tracking-wide text-muted uppercase">Merma</span>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="99"
                        step="0.1"
                        value={row.waste}
                        onChange={(e) => updateIngredientRow(row.key, { waste: e.target.value })}
                        placeholder="0"
                        aria-label={`Merma del ingrediente ${index + 1}`}
                        className={`${inputClass()} pr-7`}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">%</span>
                    </div>
                  </label>
                  <div className="min-w-0">
                    <span className="mb-1 block text-[11px] font-medium tracking-wide text-muted uppercase">Costo</span>
                    <div className="flex h-[42px] items-center justify-end rounded-control border border-line bg-surface px-3 text-sm font-semibold tabular-nums text-ink">
                      {lineCost > 0 ? formatMoney(lineCost) : '—'}
                    </div>
                  </div>
                </div>
                {showConversion && (
                  <p className="text-xs text-muted">
                    = {convertQuantity(qty, rowUnit as UnitType, productUnit).toLocaleString('es', { maximumFractionDigits: 3 })}{' '}
                    {UNIT_LABELS[productUnit]} de inventario
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {errors.ingredients && <p className="text-xs font-medium text-bad">{errors.ingredients}</p>}
        <button
          type="button"
          onClick={() => setIngredientRows((current) => [...current, newIngredientRow()])}
          disabled={ingredientRows.length >= ingredients.length}
          className="flex items-center gap-1 text-sm font-medium text-accent-text hover:text-accent-hover disabled:cursor-not-allowed disabled:text-muted"
        >
          <Plus size={14} /> Agregar ingrediente
        </button>
        <p className="text-xs text-muted">
          Elige la cantidad y su unidad: puede ser distinta a la del inventario (ej. producto en lb, receta en oz) y el costo se
          convierte solo. Con merma, el coste usa la cantidad bruta: neta / (1 − merma).
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Subrecetas</h3>
        {subrecipeRows.length === 0 ? (
          <p className="text-[13px] text-muted">Sin subrecetas. Úsalas para recetas dentro de recetas, como salsas o masas.</p>
        ) : (
          <div className="space-y-2">
            {subrecipeRows.map((row, index) => {
              const sub = recipes.find((r) => r.id === row.recipeId);
              return (
                <div key={row.key} className="flex items-center gap-2">
                  <Select
                    value={row.recipeId}
                    onChange={(e) => updateSubrecipeRow(row.key, { recipeId: e.target.value })}
                    aria-label={`Subreceta ${index + 1}`}
                    className="min-w-0 flex-1"
                  >
                    <option value="">Seleccionar receta</option>
                    {selectableRecipes.map((recipe) => (
                      <option key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </option>
                    ))}
                  </Select>
                  <div className="relative w-28">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={row.quantity}
                      onChange={(e) => updateSubrecipeRow(row.key, { quantity: e.target.value })}
                      placeholder="Cant."
                      aria-label={`Cantidad de la subreceta ${index + 1}`}
                      className={`${inputClass()} pr-10`}
                    />
                    {sub && (
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">
                        {UNIT_LABELS[sub.yieldUnit ?? 'unit']}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubrecipeRows((current) => current.filter((r) => r.key !== row.key))}
                    aria-label={`Quitar subreceta ${index + 1}`}
                    className={buttonClass('icon-danger')}
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {errors.subrecipes && <p className="text-xs font-medium text-bad">{errors.subrecipes}</p>}
        <button
          type="button"
          onClick={() => setSubrecipeRows((current) => [...current, newSubrecipeRow()])}
          className="flex items-center gap-1 text-sm font-medium text-accent-text hover:text-accent-hover disabled:cursor-not-allowed disabled:text-muted"
        >
          <Plus size={14} /> Agregar subreceta
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Empaque</h3>
        {packagingRows.length === 0 ? (
          <p className="text-[13px] text-muted">Sin empaque. Agrega envases, bolsas o consumibles que se sirven con el plato.</p>
        ) : (
          <div className="space-y-2">
            {packagingRows.map((row, index) => (
              <div key={row.key} className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    value={row.name}
                    onChange={(e) => updatePackagingRow(row.key, { name: e.target.value })}
                    placeholder="Ej: Bolsa para llevar"
                    aria-label={`Empaque ${index + 1}`}
                    className={inputClass()}
                  />
                  <button
                    type="button"
                    onClick={() => setPackagingRows((current) => current.filter((r) => r.key !== row.key))}
                    aria-label={`Quitar empaque ${index + 1}`}
                    className={buttonClass('icon-danger')}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 pl-1">
                  <div className="relative w-24">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={row.quantity}
                      onChange={(e) => updatePackagingRow(row.key, { quantity: e.target.value })}
                      placeholder="1"
                      aria-label={`Cantidad del empaque ${index + 1}`}
                      className={inputClass()}
                    />
                  </div>
                  <Select
                    value={row.unit}
                    onChange={(e) => updatePackagingRow(row.key, { unit: e.target.value as UnitType })}
                    aria-label={`Unidad del empaque ${index + 1}`}
                    className="w-24"
                  >
                    {UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {UNIT_LABELS[unit]}
                      </option>
                    ))}
                  </Select>
                  <div className="relative w-28">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      value={row.unitCost}
                      onChange={(e) => updatePackagingRow(row.key, { unitCost: e.target.value })}
                      placeholder="0.00"
                      aria-label={`Coste unitario del empaque ${index + 1}`}
                      className={`${inputClass()} pl-6`}
                    />
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted">$</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {errors.packaging && <p className="text-xs font-medium text-bad">{errors.packaging}</p>}
        <button
          type="button"
          onClick={() => setPackagingRows((current) => [...current, newPackagingRow()])}
          className="flex items-center gap-1 text-sm font-medium text-accent-text hover:text-accent-hover disabled:cursor-not-allowed disabled:text-muted"
        >
          <Plus size={14} /> Agregar empaque
        </button>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Alérgenos</h3>
        <p className="text-xs text-muted">
          Los alérgenos de ingredientes y subrecetas se marcan solos (etiqueta «auto»). Añade aquí solo los que
          correspondan directamente a esta elaboración.
        </p>
        <AllergenPicker selected={manualAllergens} onChange={setManualAllergens} autoSelected={autoDetectedAllergens} />
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Elaboración y foto</h3>
        <Field label="Pasos de elaboración (opcional)" htmlFor={`${id}-steps`} hint="Un paso por línea. Aparecen numerados en la ficha técnica.">
          <textarea
            id={`${id}-steps`}
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            placeholder={'Sella la carne 3 min por lado\nTuesta el pan y unta la salsa\nMonta y empaca'}
            rows={4}
            className={inputClass()}
          />
        </Field>
        <Field label="Foto del plato (URL, opcional)" htmlFor={`${id}-image`}>
          <input
            id={`${id}-image`}
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://…"
            className={inputClass()}
          />
        </Field>
        {imageUrl.trim() && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Vista previa de ${name || 'el plato'}`}
            className="h-36 w-full rounded-control border border-line object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-semibold tracking-wide text-muted uppercase">Precio, IVA y canales</h3>
        <div className="grid grid-cols-3 gap-3">
          <Field label="PVP con IVA ($)" htmlFor={`${id}-price`} error={errors.sellingPrice}>
            <input
              id={`${id}-price`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              placeholder="0.00"
              aria-invalid={!!errors.sellingPrice}
              className={inputClass(errors.sellingPrice)}
            />
          </Field>
          <Field label="IVA %" htmlFor={`${id}-tax`} error={errors.taxRate}>
            <input
              id={`${id}-tax`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="8.25"
              aria-invalid={!!errors.taxRate}
              className={inputClass(errors.taxRate)}
            />
          </Field>
          <Field label="Objetivo food cost %" htmlFor={`${id}-foodcost`} error={errors.targetFoodCost}>
            <input
              id={`${id}-foodcost`}
              type="number"
              inputMode="decimal"
              min="0"
              max="99"
              step="0.1"
              value={targetFoodCost}
              onChange={(e) => setTargetFoodCost(e.target.value)}
              placeholder="30"
              aria-invalid={!!errors.targetFoodCost}
              className={inputClass(errors.targetFoodCost)}
            />
          </Field>
        </div>

        <div className="space-y-2">
          {channelRows.map((row) => {
            const channel = DEFAULT_CHANNELS.find((c) => c.id === row.channelId)!;
            return (
              <div key={row.key} className="flex items-center gap-2 rounded-control border border-line bg-page p-2">
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => updateChannelRow(row.key, { enabled: e.target.checked })}
                    className="h-4 w-4 accent-accent"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-ink">{channel.name}</span>
                    <span className="block truncate text-xs text-muted">{channel.description}</span>
                  </span>
                </label>
                <div className="relative w-24">
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    disabled={!row.enabled}
                    value={row.price}
                    onChange={(e) => updateChannelRow(row.key, { price: e.target.value })}
                    placeholder={price ? price.toFixed(2) : 'PVP'}
                    aria-label={`PVP con IVA en ${channel.name}`}
                    className={`${inputClass()} pl-6 disabled:bg-line/40 disabled:text-muted`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted">$</span>
                </div>
              </div>
            );
          })}
        </div>
        {errors.channels && <p className="text-xs font-medium text-bad">{errors.channels}</p>}
        <p className="text-xs text-muted">
          El canal en blanco usa el PVP base. Para el local se cobra comisión bancaria; para Uber/Rappi, la comisión de la plataforma.
        </p>
      </section>

      <section className="rounded-control border border-line bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-ink">Vista previa del costeo</p>
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-muted">Ingredientes</dt>
            <dd className="font-semibold text-ink">{formatMoney(preview.ingredientCost)}</dd>
          </div>
          <div>
            <dt className="text-muted">Subrecetas</dt>
            <dd className="font-semibold text-ink">{formatMoney(preview.subrecipeCost)}</dd>
          </div>
          <div>
            <dt className="text-muted">Empaque</dt>
            <dd className="font-semibold text-ink">{formatMoney(preview.packagingCost)}</dd>
          </div>
          <div>
            <dt className="text-muted">Coste base</dt>
            <dd className="font-semibold text-ink">{formatMoney(preview.baseCost)}</dd>
          </div>
          <div>
            <dt className="text-muted">Margen seguridad</dt>
            <dd className="font-semibold text-ink">{formatPercent(preview.safetyMarginPercent)}</dd>
          </div>
          <div>
            <dt className="text-muted">Coste final</dt>
            <dd className="font-semibold text-ink">{formatMoney(preview.totalCost)}</dd>
          </div>
          <div>
            <dt className="text-muted">Coste por porción</dt>
            <dd className={`font-semibold ${marginTone(preview.marginPercentage) === 'bad' ? 'text-bad' : 'text-ink'}`}>
              {formatMoney(preview.costPerServing)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Precio sin IVA</dt>
            <dd className="font-semibold text-ink">{formatMoney(preview.priceWithoutTax)}</dd>
          </div>
          <div>
            <dt className="text-muted">Rinde</dt>
            <dd className="font-semibold text-ink">
              {preview.yieldQuantity} {UNIT_LABELS[yieldUnit]}
            </dd>
          </div>
        </dl>

        <p className="mt-4 mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Comparativa por canal</p>
        <ChannelList analysis={preview} />
        {preview.warnings.length > 0 && (
          <ul className="mt-3 space-y-1">
            {preview.warnings.map((warning, index) => (
              <li key={index} className="text-xs font-medium text-bad">
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>
    </form>
  );
}
