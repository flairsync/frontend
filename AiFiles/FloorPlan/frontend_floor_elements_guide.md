# Frontend Floor Plan — Elements Guide

Base URL: `https://api.flairsync.com/api/v1`

The floor plan system now supports **two types of objects per floor**:

| Type | Purpose |
|------|---------|
| **Tables** | Bookable seats — linked to reservations and orders |
| **Elements** | Visual-only decorations: walls, plants, WC signs, pillars, doors, etc. |

Elements are returned alongside tables when you fetch floors, so a single `GET /floors` call gives you everything needed to render the full canvas.

---

## 1. Element Types (Enum)

When creating or updating an element, the `type` field must be one of:

| Value | What it represents |
|-------|--------------------|
| `wall` | A wall segment |
| `wc` | WC / restroom sign |
| `plant` | Decorative plant |
| `pillar` | Structural column / pillar |
| `bar` | Bar counter |
| `window` | Window |
| `door` | Door / entrance |
| `stairs` | Stairs |
| `elevator` | Elevator |
| `label` | Free text label on the canvas |
| `shape` | Generic shape (use `style` to customize) |

---

## 2. Position Object

Every element has a `position` field with this shape:

```json
{
  "x": 100,        // number, required — canvas X coordinate (pixels or grid units)
  "y": 200,        // number, required — canvas Y coordinate
  "width": 80,     // number, optional — bounding box width
  "height": 40,    // number, optional — bounding box height
  "rotation": 45   // number, optional — rotation in degrees (default 0)
}
```

The frontend is free to use `width`/`height` as actual pixel dimensions or as scale factors — whatever fits the canvas library you are using (Konva, Fabric.js, plain SVG, etc.).

---

## 3. Style Object (optional)

Pass a free-form `style` JSON to store visual overrides. The backend stores it as-is and returns it unchanged — the frontend owns the interpretation.

```json
{
  "color": "#4CAF50",
  "backgroundColor": "#e8f5e9",
  "borderColor": "#388E3C",
  "opacity": 0.8,
  "fontSize": 14
}
```

---

## 4. Endpoints

All routes are scoped under `businesses/:businessId/floor-plan/elements`.

### Create a single element

```
POST /businesses/:businessId/floor-plan/elements
```

**Body:**
```json
{
  "type": "plant",
  "label": "Ficus",
  "position": { "x": 120, "y": 80, "width": 30, "height": 30 },
  "style": { "color": "#4CAF50" },
  "floorId": "floor-uuid-here"
}
```

**Required fields:** `type`, `floorId`
**Optional fields:** `label`, `position`, `style`

---

### Create multiple elements at once (batch)

Use this when saving the full canvas state — send all elements in one call instead of looping.

```
POST /businesses/:businessId/floor-plan/elements/batch
```

**Body:**
```json
{
  "floorId": "floor-uuid-here",
  "elements": [
    {
      "type": "wall",
      "position": { "x": 0, "y": 0, "width": 400, "height": 10, "rotation": 0 }
    },
    {
      "type": "wc",
      "label": "WC",
      "position": { "x": 350, "y": 20, "width": 40, "height": 40 }
    },
    {
      "type": "plant",
      "position": { "x": 60, "y": 300, "width": 30, "height": 30 },
      "style": { "color": "#388E3C" }
    }
  ]
}
```

**Note:** Every element in `elements[]` inherits the top-level `floorId`. If an individual element also includes a `floorId`, it is overridden by the top-level one.

---

### Get all elements

```
GET /businesses/:businessId/floor-plan/elements
```

Optional query param to filter by floor:

```
GET /businesses/:businessId/floor-plan/elements?floorId=floor-uuid-here
```

**Response:**
```json
[
  {
    "id": "element-uuid",
    "type": "plant",
    "label": "Ficus",
    "position": { "x": 120, "y": 80, "width": 30, "height": 30 },
    "style": { "color": "#4CAF50" },
    "floorId": "floor-uuid-here",
    "createdAt": "2026-05-14T10:00:00.000Z",
    "updatedAt": "2026-05-14T10:00:00.000Z"
  }
]
```

---

### Update an element

```
PATCH /businesses/:businessId/floor-plan/elements/:elementId
```

All fields are optional — send only what changed:

```json
{
  "position": { "x": 150, "y": 90, "width": 30, "height": 30 },
  "label": "Big Ficus"
}
```

---

### Delete an element

```
DELETE /businesses/:businessId/floor-plan/elements/:elementId
```

Returns a success response. If the floor itself is deleted, all its elements are cascade-deleted automatically.

---

## 5. GET /floors already includes elements

When you call `GET /businesses/:businessId/floor-plan/floors`, each floor now returns **both** `tables` and `elements`:

```json
[
  {
    "id": "floor-uuid",
    "name": "1st Floor",
    "order": 0,
    "tables": [
      { "id": "...", "name": "Table 1", "capacity": 4, "position": { "x": 100, "y": 150 }, ... }
    ],
    "elements": [
      { "id": "...", "type": "wall", "position": { "x": 0, "y": 0, "width": 400, "height": 10 }, ... },
      { "id": "...", "type": "plant", "label": "Ficus", "position": { "x": 120, "y": 80 }, ... }
    ]
  }
]
```

This means **you only need one GET call to render the complete floor canvas**. No extra requests required.

---

## 6. Recommended Frontend Implementation

### Canvas save flow (drag-and-drop editor)

When the user finishes editing a floor and hits "Save":

1. Collect the current state of all elements on the canvas (positions, types, styles).
2. **Delete** elements that were removed (call `DELETE /elements/:id` for each).
3. **Batch-create** newly added elements with `POST /elements/batch`.
4. **PATCH** elements that were moved or restyled (one call per changed element).

> Alternatively, if your editor tracks a full "replace" state, you can delete all existing elements for the floor and re-batch-create the entire canvas on every save — simpler to implement, slightly heavier on the API.

### Rendering elements

Each `type` should map to a visual component or icon on your canvas:

```
wall     → thin rectangle (full border/fill)
wc       → icon or "WC" text badge
plant    → leaf icon or green circle
pillar   → filled square/circle (grey)
bar      → thick rectangle (dark brown)
window   → thin rectangle (light blue, dashed border)
door     → arc / door icon
stairs   → striped rectangle
elevator → square with arrow icon
label    → plain text node (use `label` field as content)
shape    → generic rectangle/circle based on style
```

Use `position.rotation` to rotate the rendered component on the canvas.
Use `style.*` fields to override the default colors for that element type.

### Element vs Table distinction

Tables have `capacity`, `status`, and `number` — they are interactive (clickable, assignable to reservations).

Elements have no operational state — they are **always rendered in the background layer**, behind tables, and are never clickable for reservations.

---

## 7. Example: Full floor canvas state

```json
GET /businesses/biz-123/floor-plan/floors

[
  {
    "id": "floor-1",
    "name": "Main Hall",
    "order": 0,
    "tables": [
      { "id": "t1", "name": "Table 1", "number": 1, "capacity": 4, "status": "available", "position": { "x": 200, "y": 150, "width": 60, "height": 60, "shape": "rectangle" } },
      { "id": "t2", "name": "Table 2", "number": 2, "capacity": 2, "status": "reserved",  "position": { "x": 320, "y": 150, "width": 50, "height": 50, "shape": "circle" } }
    ],
    "elements": [
      { "id": "e1", "type": "wall",  "position": { "x": 0,   "y": 0,   "width": 500, "height": 10 } },
      { "id": "e2", "type": "wall",  "position": { "x": 0,   "y": 0,   "width": 10,  "height": 400 } },
      { "id": "e3", "type": "door",  "position": { "x": 200, "y": 0,   "width": 60,  "height": 10 } },
      { "id": "e4", "type": "wc",    "label": "WC", "position": { "x": 450, "y": 20, "width": 40, "height": 40 } },
      { "id": "e5", "type": "plant", "position": { "x": 30,  "y": 30,  "width": 25,  "height": 25 }, "style": { "color": "#4CAF50" } },
      { "id": "e6", "type": "plant", "position": { "x": 30,  "y": 340, "width": 25,  "height": 25 }, "style": { "color": "#4CAF50" } }
    ]
  }
]
```
