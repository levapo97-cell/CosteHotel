'use client';

import { FormEvent, useId, useState } from 'react';
import { Ingredient, MovementType } from '@/types';
import { MovementInput } from '@/store/inventoryStore';
import { UNIT_LABELS, formatMoney } from '@/lib/costing';
import { MOVEMENT_TYPES, formatQty } from '@/lib/inventory';
import { Field, Select, inputClass } from '@/components/ui/Form';

type Errors = Partial<Record<'product' | 'quantity' | 'unitCost', string>>;

interface MovementFormProps {
  formId: string;
  products: Ingredient[];
  initialProductId?: string;
  onSubmit: (input: MovementInput) => void;
}

export function MovementForm({ formId, products, initialProductId, onSubmit }: MovementFormProps) {
  const id = useId();
  const [productId, setProductId] = useState(initialProductId ?? '');
  const [type, setType] = useState<MovementType>('purchase');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const product = products.find((p) => p.id === productId);
  const unit = product ? UNIT_LABELS[product.unitType] : '';
  const stock = product?.currentStock ?? 0;
  const qty = Number(quantity);
  const cost = Number(unitCost);
  const isPurchase = type === 'purchase';
  const isAdjustment = type === 'adjustment';

  const validation: Errors = {};
  if (!product) validation.product = 'Selecciona un producto.';
  if (quantity === '' || !(isAdjustment ? qty >= 0 : qty > 0)) {
    validation.quantity = isAdjustment ? 'Ingresa el stock contado.' : 'La cantidad debe ser mayor a 0.';
  } else if (product && (type === 'consumption' || type === 'waste') && qty > stock) {
    validation.quantity = `Solo hay ${formatQty(stock)} ${unit} en stock.`;
  } else if (product && isAdjustment && qty === stock) {
    validation.quantity = 'El conteo es igual al stock actual; no hay nada que ajustar.';
  }
  if (isPurchase && (unitCost === '' || !(cost > 0))) validation.unitCost = 'El costo debe ser mayor a 0.';
  const errors = submitted ? validation : {};

  const valid = Object.keys(validation).length === 0;
  const stockAfter = isPurchase ? stock + qty : isAdjustment ? qty : stock - qty;
  const costAfter =
    isPurchase && product ? (stock > 0 ? (stock * product.costPerUnit + qty * cost) / (stock + qty) : cost) : product?.costPerUnit;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!valid) return;
    onSubmit({
      ingredientId: productId,
      type,
      quantity: qty,
      unitCost: isPurchase ? cost : undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-5">
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-gray-700">Tipo de movimiento</legend>
        <div role="radiogroup" className="grid grid-cols-4 gap-1 rounded-lg border border-gray-300 bg-gray-50 p-1">
          {(Object.keys(MOVEMENT_TYPES) as MovementType[]).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                type === value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {MOVEMENT_TYPES[value].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">{MOVEMENT_TYPES[type].hint}</p>
      </fieldset>

      <Field label="Producto" htmlFor={`${id}-product`} error={errors.product}>
        <Select id={`${id}-product`} value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Seleccionar producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({formatQty(p.currentStock)} {UNIT_LABELS[p.unitType]})
            </option>
          ))}
        </Select>
      </Field>

      <div className={`grid gap-4 ${isPurchase ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <Field
          label={`${isAdjustment ? 'Stock contado' : 'Cantidad'}${unit ? ` (${unit})` : ''}`}
          htmlFor={`${id}-qty`}
          error={errors.quantity}
        >
          <input
            id={`${id}-qty`}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            aria-invalid={!!errors.quantity}
            className={inputClass(errors.quantity)}
          />
        </Field>
        {isPurchase && (
          <Field label={`Costo por ${unit || 'unidad'} ($)`} htmlFor={`${id}-cost`} error={errors.unitCost}>
            <input
              id={`${id}-cost`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="0.00"
              aria-invalid={!!errors.unitCost}
              className={inputClass(errors.unitCost)}
            />
          </Field>
        )}
      </div>

      <Field label="Nota (opcional)" htmlFor={`${id}-note`}>
        <input
          id={`${id}-note`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={isPurchase ? 'Ej: Factura 001-2345, Proveedor Don Pepe' : 'Ej: Producto vencido'}
          className={inputClass()}
        />
      </Field>

      {product && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">Resultado</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Stock</dt>
              <dd className="font-semibold text-gray-900">
                {formatQty(stock)} → {quantity !== '' ? formatQty(Math.max(stockAfter, 0)) : '—'} {unit}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Costo promedio</dt>
              <dd className="font-semibold text-gray-900">
                {formatMoney(product.costPerUnit)}
                {isPurchase && cost > 0 && qty > 0 && ` → ${formatMoney(costAfter ?? 0)}`}
              </dd>
            </div>
          </dl>
          {isPurchase && cost > 0 && qty > 0 && (
            <p className="mt-3 text-xs text-gray-500">
              Total de la compra: {formatMoney(qty * cost)}. Las recetas que usan este producto se recalculan con el
              nuevo costo.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
