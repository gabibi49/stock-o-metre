---
id: abc-certification
lang: en
slug: abc-xyz-policy
title: 'ABC-XYZ: classify 6 items and choose how to manage them'
description: 'ABC classification by value, XYZ classification by coefficient of variation, cross matrix and choice of a replenishment policy for each item.'
theme: abc
level: certification
order: 1
minutes: 35
guide: guideAbcXyz
tool: true
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

Below are 6 months of usage for 6 items. You need to propose a suitable management policy for each one.

1. Run an ABC classification on 6-month usage value (80 / 15 / 5% thresholds, cumulative share measured before the item).
2. Calculate the coefficient of variation CV = σ ÷ μ of monthly usage and run an XYZ classification (X: CV < 0.5; Y: 0.5 ≤ CV ≤ 1; Z: CV > 1).
3. Place each item in the ABC-XYZ matrix.
4. For each item, choose a policy among: **(a)** reorder point with calculated safety stock; **(b)** buy to order, no permanent stock; **(c)** large lots and a simple min / max rule. Justify your choice.
5. Calculate the safety stock of P-01 and P-02 at 98% (Z = 2.0537), with lead time plus review equal to one month. Comment.

## Data

| Item | M1  | M2  | M3  | M4  | M5  | M6  | Unit price |
| ---- | --- | --- | --- | --- | --- | --- | ---------- |
| P-01 | 100 | 110 | 95  | 105 | 100 | 90  | €55        |
| P-02 | 40  | 0   | 120 | 10  | 0   | 70  | €200       |
| P-03 | 250 | 380 | 60  | 330 | 120 | 60  | €8         |
| P-04 | 500 | 520 | 480 | 510 | 490 | 500 | €2         |
| P-05 | 30  | 0   | 0   | 90  | 0   | 0   | €15        |
| P-06 | 60  | 80  | 40  | 90  | 50  | 40  | €6         |

Use the sample standard deviation (divide by n − 1 = 5).

## Solution

### Step 1 — ABC classification

| Item | Quantity (6 months) | Value   | Share  | Cumulative before | Class |
| ---- | ------------------- | ------- | ------ | ----------------- | ----- |
| P-02 | 240                 | €48,000 | 47.73% | 0.00%             | A     |
| P-01 | 600                 | €33,000 | 32.82% | 47.73%            | A     |
| P-03 | 1,200               | €9,600  | 9.55%  | 80.55%            | B     |
| P-04 | 3,000               | €6,000  | 5.97%  | 90.10%            | B     |
| P-06 | 360                 | €2,160  | 2.15%  | 96.06%            | C     |
| P-05 | 120                 | €1,800  | 1.79%  | 98.21%            | C     |

Total: €100,560. P-03 starts at 80.55%, above the 80% threshold: it is B.

### Step 2 — XYZ classification

| Item | μ (per month) | σ      | CV   | Class |
| ---- | ------------- | ------ | ---- | ----- |
| P-01 | 100           | 7.07   | 0.07 | X     |
| P-02 | 40            | 47.75  | 1.19 | Z     |
| P-03 | 200           | 139.57 | 0.70 | Y     |
| P-04 | 500           | 14.14  | 0.03 | X     |
| P-05 | 20            | 36.33  | 1.82 | Z     |
| P-06 | 60            | 20.98  | 0.35 | X     |

Example for P-02: deviations from the mean 0, −40, +80, −30, −40, +30; sum of squares 11,400; variance 11,400 ÷ 5 = 2,280; σ = 47.75; CV = 47.75 ÷ 40 = 1.19.

### Step 3 — Matrix

|       | X    | Y    | Z    |
| ----- | ---- | ---- | ---- |
| **A** | P-01 |      | P-02 |
| **B** | P-04 | P-03 |      |
| **C** | P-06 |      | P-05 |

### Step 4 — Policy

- **P-01 (AX)**: (a). Expensive and very steady: the formula works well, and tight settings avoid tying up cash. Frequent review.
- **P-02 (AZ)**: (b). Expensive and erratic, with no usage in two months out of six. The normal distribution describes this demand poorly, and a calculated safety stock would be very costly (see step 5). Work on the forecast with the customer, get firm orders earlier, or buy to order.
- **P-03 (BY)**: (a), with a forecast that follows the swings. Demand fluctuates strongly: check for seasonality before fixing a safety stock.
- **P-04 (BX)**: (a) or (c). Very steady and cheap: a simple reorder point, or large lots.
- **P-06 (CX)**: (c). Low value, steady demand: large lots and min / max, no fine-tuning.
- **P-05 (CZ)**: (b), or a small fixed stock if the supplier lead time is long. A single significant usage in six months: permanent stock would probably sit idle.

### Step 5 — Safety stocks

```
P-01: SS = 2.0537 × 7.07 × √1 = 14.52 → 15 units, i.e. €825
P-02: SS = 2.0537 × 47.75 × √1 = 98.06 → 99 units, i.e. €19,800
```

The safety stock of P-02 alone is worth 2.5 months of average usage and 24 times that of P-01 in value. For an AZ item, this is a sign that you need a different method (step 4) rather than more stock.
