---
id: abc-beginner
lang: en
slug: abc-analysis-beginner
title: 'ABC analysis of 10 items'
description: 'Calculate annual usage value, sort, accumulate and classify 10 items into A, B and C, then see why you rank by value rather than quantity.'
theme: abc
level: beginner
order: 1
minutes: 20
guide: guideAbcXyz
tool: true
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

You want to focus your control effort on the items that matter most. Classify the 10 items below using ABC analysis, with **80 / 15 / 5%** thresholds on annual usage value.

1. Calculate the annual usage value of each item.
2. Sort the items by decreasing value and calculate the cumulative share.
3. Assign classes A, B and C.
4. The two items with the highest quantity are the screw V-101 and the nut E-207. Why are they class C?

## Data

| Item  | Description   | Annual usage (units) | Unit price |
| ----- | ------------- | -------------------- | ---------- |
| V-101 | Screw         | 25,000               | €0.10      |
| M-210 | Motor         | 300                  | €300.00    |
| R-330 | Bearing       | 4,000                | €15.00     |
| C-115 | Circuit board | 250                  | €80.00     |
| J-402 | Seal          | 10,000               | €0.05      |
| P-118 | Plate         | 600                  | €20.00     |
| E-207 | Nut           | 20,000               | €0.075     |
| K-512 | Mounting kit  | 140                  | €50.00     |
| T-650 | Tube          | 1,100                | €5.00      |
| F-090 | Filter        | 400                  | €2.50      |

Classification rule (the one used by Stock-o-mètre): look at the cumulative share **before** the item. Below 80%: class A. Between 80% and 95%: class B. Otherwise: class C.

## Solution

### Step 1 — Usage value

Value = usage × price. For example, M-210: 300 × 300 = €90,000. The 10 items total **€200,000**.

### Step 2 — Sort and accumulate

| Rank | Item  | Value   | Share  | Cumulative before | Cumulative after |
| ---- | ----- | ------- | ------ | ----------------- | ---------------- |
| 1    | M-210 | €90,000 | 45.00% | 0.00%             | 45.00%           |
| 2    | R-330 | €60,000 | 30.00% | 45.00%            | 75.00%           |
| 3    | C-115 | €20,000 | 10.00% | 75.00%            | 85.00%           |
| 4    | P-118 | €12,000 | 6.00%  | 85.00%            | 91.00%           |
| 5    | K-512 | €7,000  | 3.50%  | 91.00%            | 94.50%           |
| 6    | T-650 | €5,500  | 2.75%  | 94.50%            | 97.25%           |
| 7    | V-101 | €2,500  | 1.25%  | 97.25%            | 98.50%           |
| 8    | E-207 | €1,500  | 0.75%  | 98.50%            | 99.25%           |
| 9    | F-090 | €1,000  | 0.50%  | 99.25%            | 99.75%           |
| 10   | J-402 | €500    | 0.25%  | 99.75%            | 100.00%          |

### Step 3 — Classes

- **A** (cumulative before < 80%): M-210, R-330, C-115. **3 items, 85% of value.** C-115 starts at 75%, below the threshold: it is A, even though it takes the total to 85%.
- **B** (cumulative before between 80% and 95%): P-118, K-512, T-650. **3 items, 12.25% of value.**
- **C**: V-101, E-207, F-090, J-402. **4 items, 2.75% of value.**

30% of the items make up 85% of the value: that is the Pareto effect.

### Step 4 — Value or quantity?

The screw and the nut account for 45,000 of the 61,790 units used (73%), but only 2% of the value. A stockout is costly whatever the item, but the tied-up cash and the potential savings sit in the A items. For C items such as the screw, simple management is enough: large lots, generous safety stock, little monitoring.

A ranking by quantity is still useful for other questions, such as storage space or handling workload.
