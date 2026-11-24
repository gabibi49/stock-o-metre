---
id: safety-certification
lang: en
slug: safety-stock-variable-lead-time
title: 'Safety stock with a variable supplier lead time: is reliability worth paying for?'
description: 'Variable demand and lead time, holding cost of safety stock, and a quantified decision on a supplier offer.'
theme: safety
level: certification
order: 1
minutes: 30
calc: calcSafety
guide: guideSafety
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

An electronic component is used every working day. Inventory is monitored **continuously** (continuous review, R = 0). You target a **98% cycle service level**.

1. Calculate the safety stock considering demand variability only.
2. Calculate it again, adding lead time variability.
3. What is the annual holding cost of this safety stock?
4. The supplier offers to reduce the standard deviation of its lead time to 1 day, for an extra €0.10 per unit purchased. Should you accept, judging on safety stock alone?

## Data

- Demand: μ = 50 units per day, σ = 15 units per day; 250 working days per year.
- Mean lead time L = 12 working days; lead time standard deviation σL = 3 days.
- 98% cycle service level → Z = 2.0537.
- Unit cost €8; holding rate 25% per year.
- Formula with variable lead time: SS = Z × √(L × σ² + μ² × σL²).

## Solution

### Step 1 — Demand only

```
SS = Z × σ × √L = 2.0537 × 15 × √12 = 2.0537 × 15 × 3.4641 = 106.72 → 107 units
```

### Step 2 — Variable demand and lead time

- Demand term: L × σ² = 12 × 15² = 2,700.
- Lead time term: μ² × σL² = 50² × 3² = 22,500.
- Square root of the sum: √25,200 = 158.75.

```
SS = 2.0537 × 158.75 = 326.02 → 327 units
```

Lead time uncertainty weighs **eight times more** than demand uncertainty (22,500 against 2,700). Ignoring it would understate safety stock by more than two thirds.

### Step 3 — Holding cost

Unit holding cost: H = 8 × 25% = €2 per unit per year.

Annual cost of the safety stock: 327 × 2 = **€654 per year**.

### Step 4 — Supplier offer

With σL = 1 day:

- lead time term: 50² × 1² = 2,500;
- SS = 2.0537 × √(2,700 + 2,500) = 2.0537 × 72.11 = 148.10 → **149 units**.

Holding cost saved: (327 − 149) × 2 = **€356 per year**.

Extra purchase cost: 50 × 250 = 12,500 units per year × €0.10 = **€1,250 per year**.

Judging on safety stock alone, **the offer does not pay**: it costs €1,250 to save €356.

### Step 5 — What to add to the discussion

The calculation does not tell the whole story. A reliable lead time also means fewer emergencies, fewer express shipments and less time spent chasing the supplier. It frees space for 178 units in the warehouse. Put a figure on these costs before saying no, and suggest sharing the effort: at €0.02 per unit (€250 per year), the offer would pay off.
