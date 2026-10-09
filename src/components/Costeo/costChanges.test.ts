import { describe, expect, it } from 'vitest';
import { Ingredient } from '@/types';
import { referenceDeviation } from './costChanges';

const product = (over: Partial<Ingredient> = {}): Ingredient => ({
  id: 'p1',
  hotelId: 'h1',
  area: 'restaurant',
  name: 'Carne molida',
  unitType: 'kg',
  costPerUnit: 10,
  currentStock: 20,
  minStock: 5,
  lastUpdated: '2026-09-15',
  ...over,
});

describe('referenceDeviation', () => {
  it('devuelve null si no hay coste de referencia', () => {
    expect(referenceDeviation(product({ referenceCost: undefined }))).toBeNull();
    expect(referenceDeviation(product({ referenceCost: 0 }))).toBeNull();
  });

  it('es cero cuando el coste coincide con la referencia', () => {
    expect(referenceDeviation(product({ costPerUnit: 10, referenceCost: 10 }))).toEqual({ percent: 0, amount: 0 });
  });

  it('calcula una subida como porcentaje positivo', () => {
    const dev = referenceDeviation(product({ costPerUnit: 12, referenceCost: 10 }));
    expect(dev?.amount).toBeCloseTo(2);
    expect(dev?.percent).toBeCloseTo(20);
  });

  it('calcula una bajada como porcentaje negativo', () => {
    const dev = referenceDeviation(product({ costPerUnit: 8, referenceCost: 10 }));
    expect(dev?.percent).toBeCloseTo(-20);
  });
});
