'use client';

import { FormEvent, useId, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Area, Dish, Ingredient } from '@/types';
import { DishInput } from '@/store/inventoryStore';
import { UNIT_LABELS, analyzeDish, formatMoney } from '@/lib/costing';
import { AREA_COPY } from '@/lib/inventory';
import { Field, Select, inputClass } from '@/components/ui/Form';
import { MarginBadge } from '@/components/Costeo/shared';

// Cada fila tiene su propia `key` estable para que React no confunda filas al quitar una.
interface Row {
  key: string;
  ingredientId: string;
  quantity: string;
}

type Errors = Partial<Record<'name' | 'sellingPrice' | 'ingredients', string>>;

interface DishFormProps {
  formId: string;
  initial?: Dish;
  ingredients: Ingredient[];
  area: Area;
  onSubmit: (input: Omit<DishInput, 'hotelId' | 'area'>) => void;
}

const newRow = (ingredientId = '', quantity = ''): Row => ({ key: crypto.randomUUID(), ingredientId, quantity });

export function DishForm({ formId, initial, ingredients, area, onSubmit }: DishFormProps) {
  const id = useId();
  const copy = AREA_COPY[area];
  const [name, setName] = useState(initial?.name ?? '');
  const [sellingPrice, setSellingPrice] = useState(initial?.sellingPrice.toString() ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  // Se copian los valores (no las referencias) para no tocar el plato guardado al editar.
  const [rows, setRows] = useState<Row[]>(() =>
    initial ? initial.ingredients.map((item) => newRow(item.ingredientId, item.quantityNeeded.toString())) : [newRow()]
  );
  // Los errores se muestran después del primer intento de guardar y se actualizan al escribir.
  const [submitted, setSubmitted] = useState(false);

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const dishItems = rows
    .filter((row) => row.ingredientId && Number(row.quantity) > 0)
    .map((row) => ({ ingredientId: row.ingredientId, quantityNeeded: Number(row.quantity) }));
  const price = Number(sellingPrice) || 0;
  const preview = analyzeDish({ id: '', name, sellingPrice: price, ingredients: dishItems }, ingredients);

  const validation: Errors = {};
  if (!name.trim()) validation.name = `Escribe el nombre ${copy.ofRecipe}.`;
  if (!(price > 0)) validation.sellingPrice = 'El precio debe ser mayor a 0.';
  if (rows.length === 0) validation.ingredients = 'Agrega al menos un ingrediente.';
  else if (dishItems.length !== rows.length)
    validation.ingredients = 'Cada fila necesita un ingrediente y una cantidad mayor a 0.';
  const errors = submitted ? validation : {};

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validation).length > 0) return;

    onSubmit({
      name: name.trim(),
      sellingPrice: price,
      description: description.trim() || undefined,
      ingredients: dishItems,
    });
  };

  const selectedIds = new Set(rows.map((row) => row.ingredientId));

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
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

      <Field label="Precio de venta ($)" htmlFor={`${id}-price`} error={errors.sellingPrice}>
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

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-gray-700">Ingredientes</legend>
        <div className="space-y-2">
          {rows.map((row, index) => {
            const unit = ingredients.find((ing) => ing.id === row.ingredientId)?.unitType;
            return (
              <div key={row.key} className="flex items-center gap-2">
                <Select
                  value={row.ingredientId}
                  onChange={(e) => updateRow(row.key, { ingredientId: e.target.value })}
                  aria-label={`Ingrediente ${index + 1}`}
                  className="min-w-0 flex-1"
                >
                  <option value="">Seleccionar producto</option>
                  {ingredients.map((ing) => (
                    <option
                      key={ing.id}
                      value={ing.id}
                      disabled={ing.id !== row.ingredientId && selectedIds.has(ing.id)}
                    >
                      {ing.name}
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
                    onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    placeholder="Cant."
                    aria-label={`Cantidad del ingrediente ${index + 1}`}
                    className={`${inputClass()} pr-10`}
                  />
                  {unit && (
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-gray-400">
                      {UNIT_LABELS[unit]}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setRows((current) => current.filter((r) => r.key !== row.key))}
                  aria-label={`Quitar ingrediente ${index + 1}`}
                  className="rounded p-2 text-red-600 transition-colors hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
        {errors.ingredients && <p className="mt-2 text-xs text-red-600">{errors.ingredients}</p>}
        <button
          type="button"
          onClick={() => setRows((current) => [...current, newRow()])}
          disabled={rows.length >= ingredients.length}
          className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          <Plus size={14} /> Agregar ingrediente
        </button>
      </fieldset>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-sm font-medium text-gray-700">Vista previa del costeo</p>
        <dl className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Costo</dt>
            <dd className="font-semibold text-gray-900">{formatMoney(preview.totalCost)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Margen</dt>
            <dd className={`font-semibold ${preview.margin < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatMoney(preview.margin)}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">% Margen</dt>
            <dd>{price > 0 ? <MarginBadge percentage={preview.marginPercentage} /> : '—'}</dd>
          </div>
        </dl>
      </div>
    </form>
  );
}
