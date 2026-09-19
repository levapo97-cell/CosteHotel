'use client';

import { FormEvent, useId, useState } from 'react';
import { Ingredient, UnitType } from '@/types';
import { UNIT_LABELS, formatMoney } from '@/lib/costing';
import { formatQty } from '@/lib/inventory';
import { Field, Select, inputClass } from '@/components/ui/Form';

export interface ProductValues {
  name: string;
  unitType: UnitType;
  costPerUnit: number;
  initialStock: number;
  minStock: number;
}

type Errors = Partial<Record<'name' | 'costPerUnit' | 'initialStock' | 'minStock', string>>;

interface ProductFormProps {
  formId: string;
  initial?: Ingredient;
  onSubmit: (values: ProductValues) => void;
}

// Al editar solo cambian nombre y mínimo: el costo lo mueven las compras y el stock los movimientos.
export function ProductForm({ formId, initial, onSubmit }: ProductFormProps) {
  const id = useId();
  const [name, setName] = useState(initial?.name ?? '');
  const [unitType, setUnitType] = useState<UnitType>(initial?.unitType ?? 'kg');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [minStock, setMinStock] = useState(initial?.minStock.toString() ?? '');
  const [submitted, setSubmitted] = useState(false);

  const cost = Number(costPerUnit);
  const stock = Number(initialStock);
  const min = Number(minStock);
  const validation: Errors = {};
  if (!name.trim()) validation.name = 'Escribe el nombre del producto.';
  if (minStock === '' || !(min >= 0)) validation.minStock = 'El mínimo no puede ser negativo.';
  if (!initial) {
    if (costPerUnit === '' || !(cost > 0)) validation.costPerUnit = 'El costo debe ser mayor a 0.';
    if (initialStock === '' || !(stock >= 0)) validation.initialStock = 'El stock no puede ser negativo.';
  }
  const errors = submitted ? validation : {};

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validation).length > 0) return;
    onSubmit({ name: name.trim(), unitType, costPerUnit: cost, initialStock: stock, minStock: min });
  };

  const unit = UNIT_LABELS[unitType];

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Nombre" htmlFor={`${id}-name`} error={errors.name}>
        <input
          id={`${id}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Pechuga de Pollo"
          aria-invalid={!!errors.name}
          className={inputClass(errors.name)}
        />
      </Field>

      {initial ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <dl className="grid grid-cols-3 gap-3">
            <div>
              <dt className="text-gray-500">Unidad</dt>
              <dd className="font-medium text-gray-900">{unit}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Costo promedio</dt>
              <dd className="font-medium text-gray-900">{formatMoney(initial.costPerUnit)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Stock</dt>
              <dd className="font-medium text-gray-900">
                {formatQty(initial.currentStock)} {unit}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-gray-500">
            El costo se actualiza al registrar compras y el stock con los movimientos.
          </p>
        </div>
      ) : (
        <>
          <Field label="Unidad de medida" htmlFor={`${id}-unit`}>
            <Select id={`${id}-unit`} value={unitType} onChange={(e) => setUnitType(e.target.value as UnitType)}>
              <option value="kg">Kilogramo (kg)</option>
              <option value="g">Gramo (g)</option>
              <option value="l">Litro (L)</option>
              <option value="ml">Mililitro (ml)</option>
              <option value="unit">Unidad</option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={`Costo por ${unit} ($)`} htmlFor={`${id}-cost`} error={errors.costPerUnit}>
              <input
                id={`${id}-cost`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
                placeholder="0.00"
                aria-invalid={!!errors.costPerUnit}
                className={inputClass(errors.costPerUnit)}
              />
            </Field>
            <Field label={`Stock inicial (${unit})`} htmlFor={`${id}-stock`} error={errors.initialStock}>
              <input
                id={`${id}-stock`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={initialStock}
                onChange={(e) => setInitialStock(e.target.value)}
                placeholder="0"
                aria-invalid={!!errors.initialStock}
                className={inputClass(errors.initialStock)}
              />
            </Field>
          </div>
        </>
      )}

      <Field label={`Stock mínimo (${unit})`} htmlFor={`${id}-min`} error={errors.minStock}>
        <input
          id={`${id}-min`}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          placeholder="0"
          aria-invalid={!!errors.minStock}
          className={inputClass(errors.minStock)}
        />
        <p className="mt-1 text-xs text-gray-500">Se muestra una alerta cuando el stock llega a este valor.</p>
      </Field>
    </form>
  );
}
