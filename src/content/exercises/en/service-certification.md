---
id: service-certification
lang: en
slug: fill-rate-loss-function
title: 'From cycle service level to fill rate (normal loss function)'
description: 'Use the normal loss function to move from a cycle service level to a fill rate and back, and measure the effect of lot size.'
theme: service
level: certification
order: 1
minutes: 35
calc: calcSafety
guide: guideService
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

An item is managed with a reorder point. Demand during the lead time follows a normal distribution with standard deviation **σL = 100 units**. G(z) is the normal loss function: the expected number of units short per cycle is σL × G(z), where z is the safety factor (SS = z × σL).

1. With a 90% cycle service level and lots of Q = 500 units, calculate the expected shortage per cycle and the fill rate.
2. The customer requires a 99.5% fill rate and lots drop to Q = 200. Find z, the safety stock and the corresponding cycle service level.
3. Same 99.5% target, but with lots of Q = 500. What happens to z and safety stock? Conclude.

## Data

- Normal loss function: G(z) = φ(z) − z × (1 − Φ(z)), where φ is the density and Φ the cumulative distribution function of the standard normal distribution.
- Fill rate = 1 − σL × G(z) ÷ Q.
- For 90%: z = 1.2816 and φ(1.2816) = 0.1755.
- Table extract:

| z    | 1.5     | 1.6     | 1.7     | 1.8     | 1.9     | 2.0     | 2.1     |
| ---- | ------- | ------- | ------- | ------- | ------- | ------- | ------- |
| G(z) | 0.02931 | 0.02324 | 0.01829 | 0.01428 | 0.01105 | 0.00849 | 0.00647 |
| Φ(z) | 0.9332  | 0.9452  | 0.9554  | 0.9641  | 0.9713  | 0.9772  | 0.9821  |

In a spreadsheet, φ(z) = NORM.S.DIST(z, FALSE) and Φ(z) = NORM.S.DIST(z, TRUE).

## Solution

### Step 1 — Loss function at 90%

```
G(1.2816) = 0.1755 − 1.2816 × (1 − 0.90) = 0.1755 − 0.1282 = 0.0473
```

### Step 2 — Expected shortage and fill rate

Expected shortage per cycle: 100 × 0.0473 = **4.73 units**.

Fill rate = 1 − 4.73 ÷ 500 = **99.05%**.

A 90% cycle service level (one stockout every 10 cycles) still means 99% of the quantity is served on time: stockouts are short compared with the lot size.

### Step 3 — 99.5% target with Q = 200

Maximum shortage allowed per cycle: (1 − 0.995) × 200 = 1 unit.

So G(z) = 1 ÷ 100 = **0.0100**.

In the table, G(1.9) = 0.01105 and G(2.0) = 0.00849. Linear interpolation:

```
z ≈ 1.9 + 0.1 × (0.01105 − 0.0100) ÷ (0.01105 − 0.00849) = 1.9 + 0.1 × 0.41 ≈ 1.94
```

Safety stock: SS = 1.94 × 100 = **194 units**.

Cycle service level: Φ(1.94) ≈ **97.4%**.

### Step 4 — Same target with Q = 500

Shortage allowed per cycle: (1 − 0.995) × 500 = 2.5 units, so G(z) = 0.025.

```
z ≈ 1.5 + 0.1 × (0.02931 − 0.025) ÷ (0.02931 − 0.02324) = 1.5 + 0.1 × 0.71 ≈ 1.57
```

Safety stock: SS = 1.57 × 100 = **157 units**; cycle service level Φ(1.57) ≈ 94.2%.

### Step 5 — Conclusion

For the same fill rate, larger lots need **less safety stock** (157 instead of 194), because there are fewer cycles and so fewer chances of a stockout. Lot size and safety stock cannot be set independently: a target expressed as a fill rate must be converted to z **after** the order quantity is fixed.
