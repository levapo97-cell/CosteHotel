# Auditoría — cumplimiento de `analisis_app_costos_restaurante.md`

Fecha: 2026-09-23 · Alcance: módulo de **costeo** (foco actual del proyecto).
Contexto: app para un hotel de las **Islas de la Bahía, Honduras**.

Veredicto corto: **el núcleo (P0 + P1) está implementado y bien separado del
frontend, tal como pide el análisis.** El motor de costeo vive en
`src/lib/costing.ts` como dominio puro y reproduce las fórmulas del video.
`npx tsc --noEmit`, `npm run build` y `npm test` pasan sin errores.

Leyenda: ✅ cumplido · 🟡 parcial · ❌ falta

## Entregado en esta iteración (2026-10-09) — recomendaciones del chef

- ✅ **Coste de referencia + desviación + "aceptar coste"** (`Ingredient.referenceCost`,
  `referenceDeviation` en `costChanges.ts` con test). La edición del producto muestra la
  desviación vs. el promedio ponderado actual y permite aceptar el coste nuevo; el panel
  "Necesita tu atención" avisa de subidas sobre la referencia sin duplicar la alerta de la
  última compra.
- ✅ **Proveedor + categoría** del producto (`Ingredient.supplier`, `category`) en el
  formulario y visibles en la tabla de inventario.
- ✅ **Formato de compra** (caja/paquete → $/unidad) como ayuda opcional en el movimiento de compra.
- ✅ **Pasos de elaboración + foto del plato** (`Dish.preparationSteps`, `imageUrl`) en el
  formulario, en la ficha técnica (lista numerada + imagen) y miniatura en la tarjeta.
- 🟡 **Carta imprimible por canal** — pendiente (incremental; la ficha ya lista precio y
  margen por canal).

## Entregado en esta iteración (2026-09-23)

- ✅ **Historial de precios + coste por periodo (§3, §35)** — `src/lib/priceHistory.ts`
  reconstruye el costo promedio ponderado vigente a cualquier fecha y
  `PriceHistoryPanel` recostea cada receta "a esa fecha" y grafica la evolución de
  precios de los productos. Vive en Costeo → Rentabilidad.
- ✅ **Ficha técnica + descarga PDF (§28)** — `FichaTecnica.tsx` (imprimible con el
  diálogo del navegador → Guardar como PDF) con detalle del costeo línea por línea,
  resumen de costes y rentabilidad por canal. Botón en cada tarjeta de plato.
- ✅ **Tests del motor (§42)** — Vitest, 15 pruebas en `src/lib/costing.test.ts`
  (cantidad bruta, merma, margen de seguridad, IVA, comisiones, precio sugerido,
  merma ≥100 % y recetas circulares). `npm test`.
- ✅ **Skills de diseño aplicadas** — `emil-design-eng`, `impeccable` y la familia
  `taste` instaladas; feedback de pulsación Emil en botones, `prefers-reduced-motion`
  global, tokens semánticos en toda la UI nueva y `DESIGN.md` como guía del proyecto.

---

## P0 — Motor de unidades y costes  →  ✅ COMPLETO

| Requisito (§) | Estado | Dónde |
|---|---|---|
| Normalización de unidades kg→g, L→ml, cL→ml, pz (§7) | ✅ | `UNIT_FACTOR`, `toBaseQuantity` |
| Cantidad bruta = neta / (1 − merma) (§6, §32) | ✅ | `grossQuantity` |
| Coste ingrediente = bruta × coste unitario normalizado (§32) | ✅ | `calculateRecipeCost` |
| Subrecetas recursivas con coste por unidad de rendimiento (§8) | ✅ | `calculateRecipeCost` (recursión) |
| Packaging como componente aparte (§9, §10) | ✅ | `PackagingItem`, suma en el motor |
| Coste base → margen de seguridad → coste final (§13, §32) | ✅ | `baseCost`, `safetyMarginAmount`, `finalCost` |
| Coste por porción / por unidad de rendimiento (§14, §15) | ✅ | `costPerServing` |
| Casos límite (§43) | ✅ | ver detalle abajo |

**Casos límite (§43):** merma 100 % → `clampWaste` a 99.999 % + validación en form;
cantidades/precios negativos → `min=0` y guardas; rendimiento 0 → guarda `> 0 ? : 1`;
IVA negativo → error de form + `Math.max(0)`; comisión > 100 % → advertencia;
receta circular A→B→A → set `seen` en el motor + validación de auto-inclusión en el
form. Todos cubiertos.

**Nota de arquitectura:** cumple la "decisión técnica clave" del §2019 — las
fórmulas **no** están en componentes React, sino en un motor de dominio
independiente. Bien hecho.

---

## P1 — IVA, canales, comisiones, food cost, precio sugerido  →  ✅ / 🟡

| Requisito (§) | Estado | Nota |
|---|---|---|
| Precio sin IVA = con IVA / (1 + IVA) (§16) | ✅ | `analyzeDish` |
| Comisión porcentual y fija (§22, §23) | 🟡 | Modelo y motor soportan `percentage`/`fixed`, pero **la UI solo expone 4 canales % fijos**; no hay alta de canal ni comisión mixta (%+cuota fija) que pide §23 |
| Margen bruto = sin IVA − comisión − coste (§20) | ✅ | `ChannelAnalysis` |
| % margen bruto (§21) | ✅ | reproduce 65.2 % / 42.4 % del video |
| Food cost % por canal | ✅ | `foodCostPercent` |
| Precio sugerido P = C /(F·(1−com)) (§27) | ✅ | `suggestedPriceWithTax` (Modelo B explícito) |
| Comparativa por canal (§18, §19, Fase 4) | ✅ | `ChannelComparison.tsx` (tabla agregada + lista por plato) |
| Canales local/delivery/Uber/Rappi (Fase 3) | ✅ | `DEFAULT_CHANNELS` |

**Brecha P1:** los canales son un catálogo fijo en código (`DEFAULT_CHANNELS`). El
análisis pide canales configurables con `commission_type`, `commission_percentage`
**y** `fixed_fee` combinables (§23, §30). Falta pantalla de gestión de canales y el
campo `fixed_fee` combinado (hoy `Channel` tiene un solo `commissionValue`).

---

## P2 — Históricos, versionado, PDF, dashboard  →  🟡 (mayormente cubierto)

| Requisito (§) | Estado | Detalle |
|---|---|---|
| Periodos de precios (§3) | ✅ | Selector de fecha "Costo a la fecha" en `PriceHistoryPanel` |
| Historial de precios de ingrediente (§35, `ingredient_price_history`) | ✅ | `src/lib/priceHistory.ts` reconstruye el promedio ponderado vigente a cualquier fecha desde los movimientos; evolución mostrada por producto |
| Coste/margen histórico (§35) | ✅ | `PriceHistoryPanel` recostea cada receta a la fecha elegida |
| Versionado de recetas v1/v2/v3 (§36) | ❌ | `saveDish` sobrescribe sin historial |
| Ficha técnica (§28) | ✅ | `FichaTecnica.tsx` |
| Descargar ficha PDF (§28, Fase 6) | ✅ | Impresión del navegador (Guardar como PDF) con `@media print`; `app/reportes` sigue `ComingSoon` para reportes consolidados |
| Dashboard de KPIs de costeo + alertas (§34) | 🟡 | `app/dashboard` usa datos demo (eventos/reservas); `ProfitabilityView` cubre historial e "impacto del último cambio de costo" pero faltan alertas (food cost > objetivo, margen < mínimo) |

El §35 marca el historial de precios como **"fundamental"**. Es la brecha
funcional más importante frente al análisis y conviene priorizarla si el hotel
quiere responder "¿cuánto costaba este plato el mes pasado?".

---

## Modelo de datos (§30) — cobertura

| Entidad | Estado |
|---|---|
| Ingrediente (id, nombre, unidad, coste, stock, mín.) | ✅ (+ `hotelId`, `area`) |
| — `category`, `supplier`, `valid_from/valid_to` del ingrediente | ❌ |
| Receta (nombre, código, categoría, rendimiento, unidad, margen seguridad) | ✅ |
| Ingrediente de receta (neto, unidad, merma, bruta, coste) | ✅ |
| Subreceta | ✅ |
| Packaging | ✅ |
| Canal (tipo, %, `fixed_fee`, comportamiento de IVA) | 🟡 (sin `fixed_fee`, sin alta) |
| Precio por canal | ✅ (`DishChannel`) |
| Restaurante (país, **moneda**, config. de impuestos) (§30) | ❌ (hay `Hotel`+`Area`, pero no moneda ni entidad de impuestos; IVA es constante por plato) |

---

## Extras del análisis (§44) — mejoras "más allá del video"  →  ❌ (opcionales)

Simulación de precios en vivo, simulación de comisiones, análisis de sensibilidad
("si carne +5 % → …") y punto de equilibrio: **no implementados**. Son mejoras
declaradas opcionales; no bloquean el MVP.

## Pruebas (§42)  →  ✅

Vitest configurado (`vitest.config.mts`, `npm test`). 15 pruebas en
`src/lib/costing.test.ts` cubren las fórmulas del análisis y los casos límite del
§43. Pendiente: pruebas para `priceHistory.ts` y componentes.

## Persistencia / backend (§41)

Estado **solo en memoria** (`zustand` sin persistir): se reinicia al recargar. El
análisis propone backend + PostgreSQL con Cost/Pricing/Profitability engines
separados. Como este repo es el **frontend**, es aceptable para MVP, pero para el
hotel real hará falta persistencia (mínimo `localStorage`, idealmente API).

---

## Localización Honduras / Islas de la Bahía (no está en el análisis, pero es del contexto)

- **IVA por defecto 8.25 %** viene del video, **no** de Honduras (ISV general 15 %;
  turismo e Islas de la Bahía / ZOLITUR con régimen propio). Es configurable por
  plato, pero el seed usa 8.25 %. **Verificar con la contabilidad del hotel.**
- **Moneda `$` codificada** sin selector. El turismo isleño suele usar USD, pero
  confirmar USD vs. HNL y parametrizar (`currency` del §30). Detalle en `DESIGN.md` §7.

---

## Pendiente (próximas iteraciones)

1. **Persistencia** — hoy todo es en memoria (`zustand` sin persistir) y se reinicia
   al recargar; para el hotel real hace falta al menos `localStorage` (idealmente
   API/§41). No se agregó aún por el riesgo de hidratación SSR; requiere
   `skipHydration` + rehidratación en cliente.
2. **Gestión de canales** (%+cuota fija combinada, alta/edición) (§23, §30) — hoy
   son catálogo fijo en `DEFAULT_CHANNELS`.
3. **Dashboard de costeo con alertas** (§34) — reemplazar el demo actual (food cost
   > objetivo, margen < mínimo, subida de costo de ingrediente).
4. **Versionado de recetas** (§36) y **proveedor** en productos/precios (§30, §35).
5. **Confirmar IVA y moneda del hotel** (ver `DESIGN.md` §7) y modelar `currency`.
6. **Reportes consolidados + export CSV/XLSX** (§34, Fase 6) — `app/reportes`.

Lo construido ya responde las 4 preguntas núcleo del §48 (cuánto cuesta, cuánto
gano en local, cuánto por Uber, a qué precio vender) **y** la pregunta histórica del
§35 (¿cuánto costaba antes?), con ficha técnica exportable.
