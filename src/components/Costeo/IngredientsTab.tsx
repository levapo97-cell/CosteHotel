'use client';

import { useState } from 'react';
import { Ingredient } from '@/types';
import * as Icons from 'lucide-react';

const DEMO_INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    name: 'Pechuga de Pollo',
    unitType: 'kg',
    costPerUnit: 8.50,
    currentStock: 15,
    lastUpdated: '2026-09-15',
  },
  {
    id: '2',
    name: 'Arroz Blanco',
    unitType: 'kg',
    costPerUnit: 2.20,
    currentStock: 45,
    lastUpdated: '2026-09-14',
  },
  {
    id: '3',
    name: 'Tomate Fresco',
    unitType: 'kg',
    costPerUnit: 1.80,
    currentStock: 28,
    lastUpdated: '2026-09-15',
  },
  {
    id: '4',
    name: 'Aceite de Oliva',
    unitType: 'l',
    costPerUnit: 12.00,
    currentStock: 8,
    lastUpdated: '2026-09-13',
  },
];

interface FormData {
  name: string;
  unitType: 'kg' | 'l' | 'unit' | 'g' | 'ml';
  costPerUnit: string;
  currentStock: string;
}

export function IngredientsTab() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEMO_INGREDIENTS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    unitType: 'kg',
    costPerUnit: '',
    currentStock: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.costPerUnit || !formData.currentStock) {
      return;
    }

    if (editingId) {
      setIngredients(
        ingredients.map((ing) =>
          ing.id === editingId
            ? {
                ...ing,
                name: formData.name,
                unitType: formData.unitType,
                costPerUnit: parseFloat(formData.costPerUnit),
                currentStock: parseFloat(formData.currentStock),
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : ing
        )
      );
      setEditingId(null);
    } else {
      const newIngredient: Ingredient = {
        id: Date.now().toString(),
        name: formData.name,
        unitType: formData.unitType,
        costPerUnit: parseFloat(formData.costPerUnit),
        currentStock: parseFloat(formData.currentStock),
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setIngredients([...ingredients, newIngredient]);
    }

    setFormData({
      name: '',
      unitType: 'kg',
      costPerUnit: '',
      currentStock: '',
    });
    setShowForm(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      unitType: ingredient.unitType,
      costPerUnit: ingredient.costPerUnit.toString(),
      currentStock: ingredient.currentStock.toString(),
    });
    setEditingId(ingredient.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const totalInventoryValue = ingredients.reduce(
    (sum, ing) => sum + ing.costPerUnit * ing.currentStock,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600">Total de Ingredientes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{ingredients.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600">Valor Total de Inventario</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalInventoryValue.toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-gray-600">Costo Promedio/Unidad</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${ingredients.length > 0 ? (ingredients.reduce((sum, ing) => sum + ing.costPerUnit, 0) / ingredients.length).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: '', unitType: 'kg', costPerUnit: '', currentStock: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Icons.Plus size={18} />
          {showForm ? 'Cancelar' : 'Agregar Ingrediente'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <form onSubmit={handleAddIngredient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Pechuga de Pollo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  value={formData.unitType}
                  onChange={(e) => setFormData({ ...formData, unitType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                >
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="g">Gramo (g)</option>
                  <option value="l">Litro (l)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="unit">Unidad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo por Unidad ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPerUnit}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentStock}
                  onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editingId ? 'Actualizar' : 'Agregar'} Ingrediente
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Ingrediente</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Costo/Unidad</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Stock</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Valor Total</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Actualizado</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <tr key={ingredient.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900 font-medium">{ingredient.name}</td>
                <td className="text-right px-4 py-3 text-gray-600">${ingredient.costPerUnit.toFixed(2)}</td>
                <td className="text-right px-4 py-3 text-gray-600">
                  {ingredient.currentStock} {ingredient.unitType}
                </td>
                <td className="text-right px-4 py-3 text-gray-900 font-semibold">
                  ${(ingredient.costPerUnit * ingredient.currentStock).toFixed(2)}
                </td>
                <td className="text-right px-4 py-3 text-gray-600 text-xs">
                  {ingredient.lastUpdated}
                </td>
                <td className="text-center px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(ingredient)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Icons.Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(ingredient.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Icons.Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
