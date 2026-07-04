# Office Floor Plan — Animated Dashboard Spec
**Source:** Official problem statement layout image  
**Purpose:** Accurate reference for recreating the office floor plan as an animated, live-updating SVG/HTML component in the dashboard  
**Coordinate system:** SVG viewBox `0 0 900 520` (landscape, pixel units)

---

## 1. Overall Layout

The office is a single rectangular building viewed from above. It is divided into **3 rooms side by side**, left to right. A shared corridor/hallway runs along the bottom edge. The entry door opens from the bottom-center of the building.

```
┌─────────────────┬──────────────────┬──────────────────┐
│                 │                  │                  │
│   DRAWING ROOM  │   WORK ROOM 1    │   WORK ROOM 2    │
│   (left third)  │  (middle third)  │  (right third)   │
│                 │                  │                  │
│                 │                  │                  │
├─────────────────┴──────────────────┴──────────────────┤
│               BOTTOM CORRIDOR / HALLWAY                │
│                        ↑ ENTRY                         │
└────────────────────────────────────────────────────────┘
```

**Outer building rect:** x=10, y=10, width=870, height=470, rx=4  
**Room divider 1 (Drawing | Work1):** vertical line x=305, y1=10, y2=430  
**Room divider 2 (Work1 | Work2):** vertical line x=600, y1=10, y2=430  
**Corridor floor line:** horizontal line y=430, x1=10, x2=880  
**Entry arrow:** centered at x=450, pointing up, at y=490  

---

## 2. Room Definitions

### Room 1 — Drawing Room
- **Room ID:** `drawing-room`
- **Position in SVG:** x=10, y=10, width=295, height=420
- **Fill color:** warm beige / tan `#e8dcc8`
- **Label:** "DRAWING ROOM", centered horizontally at x=157, y=200 (mid-room), font small caps, muted brown
- **Contents:** sofa (bottom-left), armchair (bottom-left near sofa), coffee table, 2 potted plants (top-left corner and bottom-left corner)
- **Wall features:** door arc on bottom wall (left side of room), window on left wall (top portion)

### Room 2 — Work Room 1
- **Room ID:** `work-room-1`
- **Position in SVG:** x=305, y=10, width=295, height=420
- **Fill color:** light gray-white `#f0eeea`
- **Label:** "WORK ROOM 1", centered at x=452, y=200
- **Contents:** 4 desks with monitors arranged in a 2×2 grid, desk chairs behind each desk, small plant bottom-center

### Room 3 — Work Room 2
- **Room ID:** `work-room-2`
- **Position in SVG:** x=600, y=10, width=280, height=420
- **Fill color:** warm tan `#ddd0b8`
- **Label:** "WORK ROOM 2", centered at x=740, y=200
- **Contents:** 4 desks with monitors arranged in a 2×2 grid, desk chairs, water cooler (bottom-right corner), small plant (bottom-right)

---

## 3. Device Positions

Every device is rendered as an interactive, state-aware component on the floor plan. The coordinates below are **center points** of each device icon within the SVG.

### 3.1 Fans

Fan icon: 3-blade ceiling fan shape (Y-like silhouette), diameter ~40px.  
**Behavior when ON:** continuous CSS/SVG rotation animation, clockwise, ~2s per revolution.  
**Behavior when OFF:** static, no rotation, blades at rest position.  
**Color ON:** `#38bdf8` (sky blue tint overlay or stroke)  
**Color OFF:** `#5a4a3a` (dark brown, matching image)

| Device ID | Room | cx | cy |
|---|---|---|---|
| `drawing-room-fan-1` | Drawing Room | 155 | 80 |
| `drawing-room-fan-2` | Drawing Room | 155 | 310 |
| `work-room-1-fan-1` | Work Room 1 | 452 | 80 |
| `work-room-1-fan-2` | Work Room 1 | 452 | 310 |
| `work-room-2-fan-1` | Work Room 2 | 740 | 80 |
| `work-room-2-fan-2` | Work Room 2 | 740 | 310 |

### 3.2 Lights

Light icon: circle, diameter ~28px with a soft glow ring around it.  
**Behavior when ON:** filled `#fbbf24` (amber/yellow), outer glow ring `rgba(251,191,36,0.4)` radius ~22px, subtle pulse animation (opacity 0.4 → 0.8, 1.5s ease-in-out infinite).  
**Behavior when OFF:** filled `#c8b99a` (muted beige-gray), no glow.

| Device ID | Room | cx | cy |
|---|---|---|---|
| `drawing-room-light-1` | Drawing Room | 60 | 60 |
| `drawing-room-light-2` | Drawing Room | 255 | 60 |
| `drawing-room-light-3` | Drawing Room | 157 | 190 |
| `work-room-1-light-1` | Work Room 1 | 355 | 60 |
| `work-room-1-light-2` | Work Room 1 | 550 | 60 |
| `work-room-1-light-3` | Work Room 1 | 452 | 390 |
| `work-room-2-light-1` | Work Room 2 | 640 | 60 |
| `work-room-2-light-2` | Work Room 2 | 835 | 60 |
| `work-room-2-light-3` | Work Room 2 | 740 | 390 |

---

## 4. Furniture & Props (Static, Non-interactive)

These are decorative SVG shapes. They do not change with device state. Render them below the device layer so devices are always visible on top.

### Drawing Room Furniture
| Element | Shape | Approx position | Color |
|---|---|---|---|
| Sofa (3-seat) | Rounded rect | x=20, y=270, w=110, h=50 | `#c9b89a` |
| Coffee table | Small rect | x=50, y=330, w=60, h=35 | `#8b7355` |
| Armchair | Small rounded rect | x=20, y=350, w=55, h=45 | `#c9b89a` |
| Plant (top-left) | Circle + stem | cx=35, cy=35 | green `#5a8a3c` |
| Plant (bottom-left) | Circle + stem | cx=35, cy=415 | green `#5a8a3c` |

### Work Room 1 Furniture (4 desks in 2×2 grid)
| Element | Position | Color |
|---|---|---|
| Desk top-left | x=325, y=145, w=80, h=55 | `#8b7355` |
| Desk top-right | x=470, y=145, w=80, h=55 | `#8b7355` |
| Desk bottom-left | x=325, y=275, w=80, h=55 | `#8b7355` |
| Desk bottom-right | x=470, y=275, w=80, h=55 | `#8b7355` |
| Monitor on each desk | small dark rect on top edge of each desk | `#2d2d2d` |
| Chair behind each desk | small rounded rect below each desk | `#3d3d3d` |
| Plant bottom-center | cx=452, cy=415 | `#5a8a3c` |

### Work Room 2 Furniture (4 desks in 2×2 grid, mirroring Work Room 1)
| Element | Position | Color |
|---|---|---|
| Desk top-left | x=620, y=145, w=80, h=55 | `#8b7355` |
| Desk top-right | x=765, y=145, w=80, h=55 | `#8b7355` |
| Desk bottom-left | x=620, y=275, w=80, h=55 | `#8b7355` |
| Desk bottom-right | x=765, y=275, w=80, h=55 | `#8b7355` |
| Monitor on each desk | small dark rect on top edge | `#2d2d2d` |
| Chair behind each desk | small rounded rect below each desk | `#3d3d3d` |
| Water cooler (bottom-right) | small rect + circle top | cx=850, cy=410 | `#b0c8e0` |
| Plant (bottom-right) | cx=860, cy=415 | `#5a8a3c` |

---

## 5. Wall Features

### Doors
- **Drawing Room door:** bottom wall, left side. Arc/quarter-circle opening inward. Center at x=90, y=430.
- **Work Room 1 door:** bottom wall, center-left. Arc opening inward. Center at x=380, y=430.
- **Work Room 2 door:** bottom wall, center-right. Arc opening inward. Center at x=675, y=430.

Door arc: radius=30px, stroke `#6b5a47`, fill transparent.

### Windows
- **Left wall (Drawing Room):** vertical rect on left edge, x=10, y=80, w=6, h=80. Fill `#b0d4e8`, stroke `#7a9eb0`.
- **Bottom wall (right side, Work Room 2 / corridor area):** horizontal rect, x=760, y=474, w=80, h=6.

---

## 6. Alert State — Room Overlay

When a room has an **active alert**, render a semi-transparent overlay rect over that room's area:

- **Color:** `rgba(245, 158, 11, 0.15)` (amber tint)
- **Border:** 2px dashed `#f59e0b`
- **Animation:** opacity pulses 0.1 → 0.3, 1.5s ease-in-out infinite
- **Layer:** between furniture and devices (furniture below, devices above)

This overlay respects room boundaries exactly — one overlay per room rect.

---

## 7. Bottom Panel — Room-wise Device Summary

A strip below the main floor plan (y=490 to y=520 in SVG, or as an HTML element below the SVG):

```
┌──────────────────┬──────────────────┬──────────────────┐
│   DRAWING ROOM   │   WORK ROOM 1    │   WORK ROOM 2    │
│   2 Fans  3 Lights│  2 Fans  3 Lights│  2 Fans  3 Lights│
│  [ON count live] │  [ON count live] │  [ON count live] │
└──────────────────┴──────────────────┴──────────────────┘
```

Each cell shows live counts: e.g. "Fans: 1/2 ON · Lights: 3/3 ON". Updates from device state.

---

## 8. Entry Label

At the bottom center:
- Up-arrow symbol `↑`
- Text: "ENTRY"
- Position: cx=450, y=510
- Font: small, uppercase, tracking wide, muted color `#6b7280`

---

## 9. Legend Panel (optional sidebar or overlay)

Can be rendered as an HTML panel to the right of the SVG, or as an SVG `<g>` at x=890 if viewBox is extended. Contents:

| Symbol | Label |
|---|---|
| Fan icon (static) | Fan (2 per room) |
| Light circle | Light (3 per room) |
| Door arc | Door |
| Window rect | Window |

Below legend, a **Devices Summary** block:
- 3 Rooms
- 2 Fans per room / 3 Lights per room
- Total Fans: 6 / Total Lights: 9 / **Total Devices: 15**

And a **Room Usage** block:
- Drawing Room – Waiting area
- Work Room 1 – Employees
- Work Room 2 – Employees

---

## 10. Animation Spec Summary

| Element | State | Animation |
|---|---|---|
| Fan blades | ON | `rotate(360deg)` infinite, 2s linear, transform-origin = fan center |
| Fan blades | OFF | Static, no transform |
| Light circle | ON | `box-shadow` / SVG `filter: drop-shadow` amber glow, opacity pulse 1.5s |
| Light circle | OFF | No glow, muted fill |
| Room overlay | Alert active | Opacity pulse 0.1↔0.3, 1.5s ease-in-out |
| Room overlay | No alert | Hidden (opacity 0) |
| Device state change | Any | 300ms cross-fade transition on color and glow properties |

**Motion preference:** Respect `prefers-reduced-motion`. When reduced motion is set, disable rotation and pulse; use a simple ON/OFF color swap only.

---

## 11. Interactivity

- **Click a room area (room overlay rect):** scrolls the device status panel (outside the floor plan) to that room's card.
- **Hover a fan or light icon:** show a tooltip with: device name, current status (ON/OFF), wattage, last changed timestamp.
- Tooltip style: dark background `#1a1d27`, white text, 8px padding, 6px border-radius, appears above the hovered icon.

---

## 12. Color Reference (Complete)

| Token | Hex | Usage |
|---|---|---|
| `--room-drawing` | `#e8dcc8` | Drawing Room floor fill |
| `--room-work1` | `#f0eeea` | Work Room 1 floor fill |
| `--room-work2` | `#ddd0b8` | Work Room 2 floor fill |
| `--wall` | `#9a8a78` | Room divider lines, outer walls |
| `--fan-on` | `#38bdf8` | Fan tint / stroke when ON |
| `--fan-off` | `#5a4a3a` | Fan color when OFF |
| `--light-on` | `#fbbf24` | Light fill when ON |
| `--light-glow` | `rgba(251,191,36,0.35)` | Light glow ring when ON |
| `--light-off` | `#c8b99a` | Light fill when OFF |
| `--alert-tint` | `rgba(245,158,11,0.15)` | Room alert overlay |
| `--alert-border` | `#f59e0b` | Room alert dashed border |
| `--furniture` | `#8b7355` | Desk / table fill |
| `--chair` | `#4a4a4a` | Chair fill |
| `--plant` | `#5a8a3c` | Plant fill |
| `--door` | `#6b5a47` | Door arc stroke |
| `--window` | `#b0d4e8` | Window fill |
| `--entry-text` | `#6b7280` | ENTRY label |
| `--text-room-label` | `#7a6a58` | Room name label |
