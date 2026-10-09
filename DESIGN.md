# DESIGN.md — Lenguaje visual de Appitit (costeo hotelero)

Referencia de estilo para esta app. Destila tres skills de diseño —
**Impeccable** (anti-slop, punto de vista, piso de calidad), **Taste Skill**
(perillas de variación) y **Emil Kowalski / emil-design-eng** (movimiento y
detalle invisible)— **aterrizadas a los tokens reales de este proyecto** y al
contexto: un hotel de las **Islas de la Bahía, Honduras**, con foco en costeo.

> Este archivo también sirve como el `DESIGN.md` que la skill Impeccable lee al
> arrancar. Si instalas Impeccable (`npx impeccable install`), ejecuta luego
> `/impeccable document` para enriquecerlo con lo que ya existe en el código.

---

## 1. Producto y tono

- **Qué es:** herramienta operativa (modo **Operate**, no marketing) para que
  chef/gerente calculen el costo real de cada receta y su rentabilidad por canal.
- **Quién la usa:** personal de restaurante y bar del hotel, en oficina y a pie
  de cocina. Densidad alta de números; decisiones rápidas.
- **Personalidad:** cálida, artesanal, confiable. Serif de marca + sans de datos.
  Nada de "dashboard genérico oscuro con neón". La calidez evoca hospitalidad
  isleña sin caer en cliché tropical (nada de palmeras ni degradados turquesa).

## 2. Tokens reales (fuente de verdad: `app/globals.css`)

No inventes colores ni uses utilidades crudas de Tailwind (`text-gray-500`,
`bg-white`, hex sueltos). Usa **siempre** los tokens semánticos ya definidos:

| Rol | Token | Uso |
|---|---|---|
| Fondo página | `--page` / `bg-page` | Único fondo base |
| Superficie | `--surface` / `bg-surface` | Cards, drawers, filas destacadas |
| Línea | `--line` / `border-line` | Bordes y divisores |
| Texto principal | `--ink` / `text-ink` | Títulos y cifras |
| Texto secundario | `--muted` / `text-muted` | Etiquetas, notas |
| Acento | `--accent` (`#e8763a`) | Acción primaria, activo |
| Acento texto | `--accent-text` | Texto/íconos en acento |
| Oro | `--gold` | Detalle premium puntual |
| Estado ok / warn / bad | `--ok` / `--warn` / `--bad` | Semáforo de rentabilidad |

Tipografía: `--font-display` (**Fraunces**, serif suave y elegante, solo títulos y
nombres de tarjeta) y `--font-sans` (**Figtree**, sans redondeada, para cuerpo,
datos y UI). Se cargan con `next/font` en `app/layout.tsx`. Cifras siempre
`tabular-nums` (ya global en `body`). Radios: `--radius-card` 16, control 12, chip
8. Sombras: `--shadow-card` (casi plana, minimalista), `--shadow-drawer`.

**Modo claro solamente** (`color-scheme: light`) es una decisión deliberada del
producto; no introduzcas dark mode sin pedirlo.

## 3. Perillas de "taste" para este proyecto (Taste Skill)

Valores objetivo para mantener coherencia. Ajusta dentro de estos rangos:

```
DESIGN_VARIANCE   = 0.35   # Operate: centrado y limpio; la audacia va en los datos, no en el layout
MOTION_INTENSITY  = 0.30   # movimiento sobrio; ver §5
VISUAL_DENSITY    = 0.65   # tablas y KPIs densos pero legibles
TYPOGRAPHY_QUALITY= alta   # jerarquía Playfair/Inter estricta, tabular-nums
```

Una herramienta de números **no** debe ser experimental en su layout: la variación
va en la calidad del detalle (jerarquía, alineación, semáforos), no en formas raras.

## 4. Anti-slop: qué NO hacer (Impeccable)

- ❌ Degradados morado-azul, glassmorphism, neón sobre negro.
- ❌ `Inter`/`Roboto` como "fuente de marca" para títulos — aquí el título es Playfair.
- ❌ Grids de cards idénticas sin jerarquía; KPIs sin unidad ni contexto.
- ❌ Verde/rojo puros de Tailwind para el semáforo — usa `--ok`/`--bad`.
- ❌ Emojis como iconografía. Usa `lucide-react` (ya es la convención del repo).
- ❌ Colorear por color; el color comunica **estado** (rentabilidad), no decora.
- ✅ Un punto de vista claro: números primero, calidez de fondo, cero ruido.

## 5. Movimiento (emil-design-eng)

Regla base: **si el usuario lo ve muchas veces al día, no lo animes.** Cambios de
pestaña, filtros de tabla y navegación no se animan. Reserva el movimiento para lo
ocasional: apertura del **Drawer** (producto/plato) y aparición de toasts/avisos.

- Drawer/hoja lateral: entra con `ease-out` fuerte, 200–300 ms, desde su borde
  (`translateX`), no desde `scale(0)`.
  `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`.
- Botones y filas presionables: `transform: scale(0.97)` en `:active`, 120–160 ms.
- Nunca `transition: all`; nombra la propiedad (`transform`, `opacity`).
- Solo anima `transform` y `opacity` (GPU). Respeta `prefers-reduced-motion`.
- La `ProgressBar` de margen puede transicionar su ancho suavemente al recalcular.

## 6. Patrones ya establecidos (respétalos)

- **KPIs:** `KpiCard`/`KpiGrid` con `label`, `value`, `note` y `tone` semáforo.
- **Semáforo de margen:** `marginTone` / `TONE_TEXT` / `MARGIN_BADGE`
  (óptimo > 35 %, revisar > 25 %, crítico ≤ 25 %). No dupliques umbrales; viven en
  `src/lib/costing.ts`.
- **Tablas de costos:** encabezados `text-[11px] uppercase text-muted`, cifras
  `tabular-nums` alineadas a la derecha.
- **Formularios por bloques** con `Field`/`InfoNote`, drawer con footer de acciones.
- **Dinero y %:** `formatMoney` (`$`) y `formatPercent`. Ver §7 sobre moneda.

## 7. Localización — Islas de la Bahía, Honduras (verificar con el hotel)

Estos valores **vienen del video de referencia, no de Honduras**. Antes de dar la
app por lista, confírmalos con la contabilidad del hotel:

- **IVA por defecto = 8.25 %** (`DEFAULT_TAX_RATE`). En Honduras el ISV general es
  15 %; el sector turístico y el régimen especial de Islas de la Bahía (ZOLITUR)
  tienen tratamiento propio. Ajusta el default al que aplique al hotel.
- **Moneda = `$`**. El turismo isleño suele cotizar en USD, pero no hay selector de
  moneda (`currency` del §30 del análisis no está modelado). Confirma USD vs. HNL
  (Lempira) y, si aplica, parametrízalo en vez de codificar `$`.

Mantener estos supuestos explícitos evita que un número "de demo" se vuelva un
error de precios en producción.

## 8. Verificación (Impeccable, en pasadas acotadas)

Construye completo, inspecciona una vez (desktop y móvil juntos), corrige todo en
un lote, confirma con una pasada más y para. No entres en bucles de auto-QA.
Mínimo a revisar en cada pantalla de costeo:

- Cifras alineadas y con unidad; sin overflow horizontal a ancho de teléfono.
- Semáforo coherente con el valor real del margen.
- Estados vacíos redactados (sin recetas, sin productos, sin cambios de costo).
- Contraste de `--accent-text` sobre blanco (~3:1): úsalo para texto grande/íconos,
  no para texto pequeño crítico.

---

### Fuentes de las skills destiladas
- Emil Kowalski — `emil-design-eng` (instalado en `~/.claude/skills/`): <https://github.com/emilkowalski/skills>
- Impeccable — Paul Bakaus: <https://github.com/pbakaus/impeccable>
- Taste Skill: <https://github.com/tasteskill/tasteskill> · <https://www.tasteskill.dev/>
