---
id: eoq-certification
lang: en
slug: eoq-quantity-discounts
title: 'EOQ with quantity discounts: which price break should you choose?'
description: 'Apply the quantity discount method: EOQ for each price break, feasible quantities and comparison of total annual cost, purchases included.'
theme: eoq
level: certification
order: 1
minutes: 30
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

A workshop buys bearings. The supplier offers price breaks based on the quantity of each order. Holding cost is a percentage of the purchase price, so it falls when the price falls.

1. Calculate the EOQ for each price break.
2. For each price break, keep the cheapest feasible quantity.
3. Compare total annual cost, purchases included, and choose the order quantity.
4. Name two risks to check before adopting this quantity.

## Data

| Order quantity | Unit price |
| -------------- | ---------- |
| 1 to 499       | €10.00     |
| 500 to 999     | €9.60      |
| 1,000 and over | €9.30      |

- Annual demand D = 5,000 units; ordering cost S = €100 per order.
- Holding rate i = 25% per year: H = i × price.
- Total annual cost: TC = D × price + (D ÷ Q) × S + (Q ÷ 2) × H.

## Solution

### Step 1 — EOQ for each price break

| Price  | H = 25% × price | Q* = √(2 × 5,000 × 100 ÷ H) |
| ------ | --------------- | --------------------------- |
| €10.00 | €2.500          | √400,000 = 632.5            |
| €9.60  | €2.400          | √416,667 = 645.5            |
| €9.30  | €2.325          | √430,108 = 655.8            |

### Step 2 — Feasible quantities

- **€10.00**: 632 is outside the break (1 to 499). The best feasible quantity would be 499, but at that price you would pay more than for 500 units. This break is ruled out.
- **€9.60**: 645 is inside the break (500 to 999). Keep **Q = 645**.
- **€9.30**: 656 is below the 1,000 minimum. Cost rises as you move away from Q*, so the best feasible quantity is the minimum of the break: **Q = 1,000**.

### Step 3 — Total costs

**Q = 645 at €9.60**

- Purchases: 5,000 × 9.60 = €48,000.00.
- Ordering: (5,000 ÷ 645) × 100 = €775.19.
- Holding: (645 ÷ 2) × 2.40 = €774.00.
- Total: **€49,549.19**.

**Q = 1,000 at €9.30**

- Purchases: 5,000 × 9.30 = €46,500.00.
- Ordering: (5,000 ÷ 1,000) × 100 = €500.00.
- Holding: (1,000 ÷ 2) × 2.325 = €1,162.50.
- Total: **€48,162.50**.

For reference, the ruled-out break (499 at €10) would cost €51,625.75.

**Decision: order 1,000 at a time.** The saving is 49,549.19 − 48,162.50 = **€1,386.69 per year**. The purchase discount (€1,500) far outweighs the increase in holding cost.

### Step 4 — Risks to check

- **Space and average stock**: average stock rises from 323 to 500 units. Is there room in the warehouse?
- **Obsolescence**: 1,000 units are 2.4 months of demand. A design change or a drop in demand would leave unsold stock.
- **Cash**: each order ties up €9,300 instead of €6,192.
- **Steady demand assumption**: if demand is seasonal, recalculate period by period.
