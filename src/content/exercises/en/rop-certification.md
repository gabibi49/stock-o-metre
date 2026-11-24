---
id: rop-certification
lang: en
slug: reorder-point-inventory-position
title: 'Reorder point and inventory position: order now or wait?'
description: 'Safety stock and reorder point from a monthly forecast, inventory position (on hand, on order, allocated) and the effect of a longer lead time.'
theme: rop
level: certification
order: 1
minutes: 25
calc: calcRop
guide: guideRop
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

An item is managed with a reorder point under continuous review. The forecast is **1,200 units per month** (20 working days). You target a **97% cycle service level**.

1. Calculate the safety stock and the reorder point.
2. Calculate today's inventory position. Should you order?
3. If demand follows the average, on which day will the order go out?
4. The supplier announces that its lead time is now 9 days. Recalculate the reorder point. What do you do today?
5. Why compare the reorder point with the inventory position rather than with stock on hand?

## Data

- Demand: 1,200 units per month of 20 working days; standard deviation σ = 18 units per day.
- Lead time L = 6 working days; 97% service level → Z = 1.8808.
- Stock on hand: 380 units.
- Open purchase order: 150 units, due in 2 days.
- Quantity allocated to a confirmed customer order not yet shipped: 40 units.

## Solution

### Step 1 — Daily demand

d = 1,200 ÷ 20 = **60 units per day**.

### Step 2 — Safety stock and reorder point

```
SS  = 1.8808 × 18 × √6 = 1.8808 × 18 × 2.4495 = 82.93 → 83 units
ROP = 60 × 6 + 82.93 = 442.93 → 443 units
```

The reorder point uses the unrounded safety stock, then is rounded up.

### Step 3 — Inventory position

```
Position = on hand + on order − allocated
         = 380 + 150 − 40 = 490 units
```

490 > 443: **no order today**.

### Step 4 — Day of the order

The position drops by 60 units a day. By tomorrow evening it will be 490 − 60 = 430 units, below the reorder point: the order goes out **tomorrow**.

The delivery of 150 units in 2 days changes nothing: those units are already counted in the position.

### Step 5 — Lead time of 9 days

```
SS  = 1.8808 × 18 × √9 = 1.8808 × 18 × 3 = 101.56 → 102 units
ROP = 60 × 9 + 101.56 = 641.56 → 642 units
```

The position (490) is far below the new reorder point (642): **order today**. Three more days of lead time raise the reorder point by 199 units: 180 of demand and 19 of safety stock.

### Step 6 — Why the inventory position?

If you compared the reorder point with stock on hand (380), you would order today although 150 units arrive in 2 days. The next day stock on hand would still be low and you would order again: a **double order**. The inventory position accounts for everything that is coming in and everything already promised.
