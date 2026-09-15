'use client';

import { useState } from 'react';
import { Dish, DishIngredient, CostAnalysis, Ingredient } from '@/types';
import * as Icons from 'lucide-react';

const DEMO_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Pechuga de Pollo', unitType: 'kg', costPerUnit: 8.50, currentStock: 15, lastUpdated: '2026-09-15' },
  { id: '2', name: 'Arroz Blanco', unitType: 'kg', costPerUnit: 2.20, currentStock: 45, lastUpdated: '2026-09-14' },
  { id: '3', name: 'Tomate Fresco', unitType: 'kg', costPerUnit: 1.80, currentStock: 28, lastUpdated: '2026-09-15' },
];

const DEMO_DISHES: Dish[] = [
  {
    id: '1',
    name: 'Pollo a la Grilla',
    sellingPrice: 25.00,
    ingredients: [
      { ingredientId: '1', quantityNeeded: 0.3 },
      { ingredientId: '2', quantityNeeded: 0.2 },
    ],
    description: 'Pechuga de pollo a la parrilla con arroz',
  },
  {
    id: '2',
    name: 'Ensalada de Tomate y Pollo',
    sellingPrice: 18.00,
    ingredients: [
      { ingredientId: '1', quantityNeeded: 0.25 },
      { ingredientId: '3', quantityNeeded: 0.15 },
    ],
    description: 'Ensalada fresca con pollo desmenuzado',
  },
];

interface FormData {
  name: string;
  sellingPrice: string;
  description: string;
  ingredients: DishIngredient[];
}

export function DishesTab() {
  const [dishes, setDishes] = useState<Dish[]>(DEMO_DISHES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    sellingPrice: '',
    description: '',
    ingredients: [],
  });

  const calculateDishCost = (ingredients: DishIngredient[]): number => {
    return ingredients.reduce((total, dishIng) => {
      const ingredient = DEMO_INGREDIENTS.find((ing) => ing.id === dishIng.ingredientId);
      return total + (ingredient ? ingredient.costPerUnit * dishIng.quantityNeeded : 0);
    }, 0);
  };

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.sellingPrice || formData.ingredients.length === 0) {
      return;
    }

    if (editingId) {
      setDishes(
        dishes.map((dish) =>
          dish.id === editingId
            ? {
                ...dish,
                name: formData.name,
                sellingPrice: parseFloat(formData.sellingPrice),
                description: formData.description,
                ingredients: formData.ingredients,
              }
            : dish
        )
      );
      setEditingId(null);
    } else {
      const newDish: Dish = {
        id: Date.now().toString(),
        name: formData.name,
        sellingPrice: parseFloat(formData.sellingPrice),
        description: formData.description,
        ingredients: formData.ingredients,
      };
      setDishes([...dishes, newDish]);
    }

    setFormData({
      name: '',
      sellingPrice: '',
      description: '',
      ingredients: [],
    });
    setShowForm(false);
  };

  const handleEdit = (dish: Dish) => {
    setFormData({
      name: dish.name,
      sellingPrice: dish.sellingPrice.toString(),
      description: dish.description || '',
      ingredients: dish.ingredients,
    });
    setEditingId(dish.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setDishes(dishes.filter((dish) => dish.id !== id));
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: '', quantityNeeded: 0 }],
    });
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    const newIngredients = [...formData.ingredients];
    if (field === 'ingredientId') {
      newIngredients[index].ingredientId = value;
    } else if (field === 'quantityNeeded') {
      newIngredients[index].quantityNeeded = parseFloat(value) || 0;
    }
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const costAnalyses: CostAnalysis[] = dishes.map((dish) => {
    const totalCost = calculateDishCost(dish.ingredients);
    const margin = dish.sellingPrice - totalCost;
    const marginPercentage = (margin / dish.sellingPrice) * 100;

    return {
      dishId: dish.id,
      dishName: dish.name,
      totalCost,
      sellingPrice: dish.sellingPrice,
      margin,
      marginPercentage,
    };
  });

  const avgMargin = costAnalyses.length > 0
    ? costAnalyses.reduce((sum, c) => sum + c.marginPercentage, 0) / costAnalyses.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600">Total de Platos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{dishes.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600">Margen Promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{avgMargin.toFixed(1)}%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-gray-600">Ingresos Potenciales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${costAnalyses.reduce((sum, c) => sum + c.sellingPrice, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              name: '',
              sellingPrice: '',
              description: '',
              ingredients: [],
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Icons.Plus size={18} />
          {showForm ? 'Cancelar' : 'Agregar Plato'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <form onSubmit={handleAddDish} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Plato</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Pollo a la Grilla"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del plato"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Ingredientes</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {formData.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex gap-2 items-end">
                    <select
                      value={ing.ingredientId}
                      onChange={(e) => handleIngredientChange(idx, 'ingredientId', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Seleccionar ingrediente</option>
                      {DEMO_INGREDIENTS.map((ingredient) => (
                        <option key={ingredient.id} value={ingredient.id}>
                          {ingredient.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={ing.quantityNeeded}
                      onChange={(e) => handleIngredientChange(idx, 'quantityNeeded', e.target.value)}
                      placeholder="Cantidad"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Icons.X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Icons.Plus size={14} /> Agregar ingrediente
              </button>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {editingId ? 'Actualizar' : 'Agregar'} Plato
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Plato</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Costo</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Precio</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">Margen</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-700">% Margen</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {costAnalyses.map((analysis) => (
              <tr key={analysis.dishId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-900 font-medium">{analysis.dishName}</td>
                <td className="text-right px-4 py-3 text-gray-600">${analysis.totalCost.toFixed(2)}</td>
                <td className="text-right px-4 py-3 text-gray-600">${analysis.sellingPrice.toFixed(2)}</td>
                <td className="text-right px-4 py-3 text-green-600 font-semibold">${analysis.margin.toFixed(2)}</td>
                <td className="text-right px-4 py-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      analysis.marginPercentage > 40
                        ? 'bg-green-100 text-green-800'
                        : analysis.marginPercentage > 25
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {analysis.marginPercentage.toFixed(1)}%
                  </span>
                </td>
                <td className="text-center px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(dishes.find((d) => d.id === analysis.dishId)!)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Icons.Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(analysis.dishId)}
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
