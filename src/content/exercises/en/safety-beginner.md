---
id: safety-beginner
lang: en
slug: safety-stock-beginner
title: 'Calculate safety stock from 8 weeks of sales'
description: 'Mean, standard deviation, lead time conversion and the Z factor: a complete safety stock calculation for one item, then the effect of a stricter service level.'
theme: safety
level: beginner
order: 1
minutes: 15
calc: calcSafety
guide: guideSafety
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

You manage a hardware item sold every week. The supplier delivers **2 weeks** after the order, and you place orders **once a week**, on Mondays. You target a **95% cycle service level**.

1. Calculate the mean weekly demand μ and the weekly standard deviation σ.
2. Calculate the safety stock with SS = Z × σ × √(L + R).
3. What happens to the safety stock if you target 99%?

## Data

| Week          | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   |
| ------------- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sales (units) | 180 | 220 | 210 | 160 | 240 | 190 | 200 | 200 |

- Lead time L = 2 weeks; review period R = 1 week.
- Z factors: 1.6449 for 95%; 2.3263 for 99%.
- Use the sample standard deviation (divide by n − 1). Safety stock is rounded up to the next unit.

## Solution

### Step 1 — Mean demand

Total over 8 weeks: 180 + 220 + 210 + 160 + 240 + 190 + 200 + 200 = 1,600 units.

μ = 1,600 ÷ 8 = **200 units per week**.

### Step 2 — Standard deviation

| Week                | 1   | 2   | 3   | 4     | 5     | 6   | 7   | 8   |
| ------------------- | --- | --- | --- | ----- | ----- | --- | --- | --- |
| Deviation from mean | −20 | +20 | +10 | −40   | +40   | −10 | 0   | 0   |
| Squared deviation   | 400 | 400 | 100 | 1,600 | 1,600 | 100 | 0   | 0   |

Sum of squares: 4,200. Variance = 4,200 ÷ (8 − 1) = 600.

σ = √600 = **24.49 units**.

### Step 3 — Protection period

Lead time and review period are already in weeks, like σ: L + R = 2 + 1 = 3 weeks, and √3 = **1.7321**.

### Step 4 — Safety stock at 95%

```
SS = 1.6449 × 24.49 × 1.7321 = 69.79 → 70 units
```

### Step 5 — Safety stock at 99%

```
SS = 2.3263 × 24.49 × 1.7321 = 98.70 → 99 units
```

Moving from 95% to 99% raises safety stock by **41%** (99 ÷ 70 ≈ 1.41) to cut the risk of a stockout per cycle by a factor of five (from 5% to 1%). Each extra point of service level costs more than the previous one.

### Check it yourself

In the calculator, choose the "Week" period and enter μ = 200, σ = 24.49, L = 14 days, R = 7 days, service level = 95%: you get 70 units.
