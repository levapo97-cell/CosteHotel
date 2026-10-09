'use client';

import { FormEvent, useId, useState } from 'react';
import { Ingredient, MovementType } from '@/types';
import { MovementInput } from '@/store/inventoryStore';
import { UNIT_LABELS, formatMoney } from '@/lib/costing';
import { MOVEMENT_TYPES, formatQty } from '@/lib/inventory';
import { Field, Segmented, Select, inputClass } from '@/components/ui/Form';

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
  // Formato de compra (opcional): se compra por caja/paquete y se normaliza a $/unidad.
  const [packSize, setPackSize] = useState('');
  const [packPrice, setPackPrice] = useState('');

  // Al cambiar el formato de compra, recalcula el costo por unidad = precio / contenido.
  const applyPackFormat = (size: string, total: string) => {
    setPackSize(size);
    setPackPrice(total);
    const s = Number(size);
    const t = Number(total);
    if (s > 0 && t > 0) setUnitCost((t / s).toString());
  };

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
      <div>
        <p className="mb-1.5 text-[13px] font-medium text-ink">Tipo de movimiento</p>
        <Segmented<MovementType>
          label="Tipo de movimiento"
          value={type}
          onChange={setType}
          options={(Object.keys(MOVEMENT_TYPES) as MovementType[]).map((value) => ({
            value,
            label: MOVEMENT_TYPES[value].label,
          }))}
        />
        <p className="mt-1.5 text-xs text-muted">{MOVEMENT_TYPES[type].hint}</p>
      </div>

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

      {isPurchase && (
        <details className="rounded-control border border-line bg-page">
          <summary className="cursor-pointer px-3 py-2.5 text-[13px] font-medium text-ink select-none">
            ¿Compraste por caja o paquete? Calcular costo por {unit || 'unidad'}
          </summary>
          <div className="space-y-2 border-t border-line p-3">
            <div className="grid grid-cols-2 gap-4">
              <Field label={`Contenido (${unit || 'unidades'} por formato)`} htmlFor={`${id}-pack-size`}>
                <input
                  id={`${id}-pack-size`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={packSize}
                  onChange={(e) => applyPackFormat(e.target.value, packPrice)}
                  placeholder="Ej: 100"
                  className={inputClass()}
                />
              </Field>
              <Field label="Precio del formato ($)" htmlFor={`${id}-pack-price`}>
                <input
                  id={`${id}-pack-price`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={packPrice}
                  onChange={(e) => applyPackFormat(packSize, e.target.value)}
                  placeholder="Ej: 40.00"
                  className={inputClass()}
                />
              </Field>
            </div>
            <p className="text-xs text-muted">
              Ej: una caja de 100 {unit || 'pz'} a $40 → {formatMoney(40 / 100)} por {unit || 'pz'}. El costo por{' '}
              {unit || 'unidad'} de arriba se completa solo; puedes ajustarlo.
            </p>
          </div>
        </details>
      )}

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
        <div className="rounded-control border border-line bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-ink">Resultado</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Stock</dt>
              <dd className="font-semibold text-ink">
                {formatQty(stock)} → {quantity !== '' ? formatQty(Math.max(stockAfter, 0)) : '—'} {unit}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Costo promedio</dt>
              <dd className="font-semibold text-ink">
                {formatMoney(product.costPerUnit)}
                {isPurchase && cost > 0 && qty > 0 && ` → ${formatMoney(costAfter ?? 0)}`}
              </dd>
            </div>
          </dl>
          {isPurchase && cost > 0 && qty > 0 && (
            <p className="mt-3 text-xs text-muted">
              Total de la compra: {formatMoney(qty * cost)}. Las recetas que usan este producto se recalculan con el
              nuevo costo.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
