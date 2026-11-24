---
id: eoq-beginner
lang: en
slug: economic-order-quantity
title: 'Economic order quantity (EOQ, Wilson formula)'
description: 'Calculate the economic order quantity, the number of orders per year and the total cost, then measure what a different quantity costs.'
theme: eoq
level: beginner
order: 1
minutes: 15
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

A small manufacturer buys packaging boxes. Each order carries a fixed cost (data entry, receiving, inspection, invoice). Holding stock also costs money (space, tied-up capital).

1. Calculate the unit holding cost H.
2. Calculate the economic order quantity Q* (Wilson formula).
3. How many orders per year? Every how many days?
4. Calculate the annual ordering cost, the annual holding cost and their total.
5. The supplier delivers in pallets of 1,000. What does ordering 1,000 instead of Q* cost?

## Data

- Annual demand D = 12,000 boxes, steady.
- Ordering cost S = €60 per order.
- Unit price €20; holding rate 20% per year.
- EOQ: Q* = √(2 × D × S ÷ H).
- Annual cost (excluding purchases): TC = (D ÷ Q) × S + (Q ÷ 2) × H. Use 365 days per year.

## Solution

### Step 1 — Unit holding cost

H = €20 × 20% = **€4 per box per year**.

### Step 2 — Economic order quantity

```
Q* = √(2 × 12,000 × 60 ÷ 4) = √360,000 = 600 boxes
```

### Step 3 — Frequency

Number of orders: 12,000 ÷ 600 = **20 orders per year**.

Interval: 365 ÷ 20 = **18.25 days**, about one order every two and a half weeks.

### Step 4 — Costs

- Ordering cost: 20 × 60 = **€1,200**.
- Holding cost: average stock 600 ÷ 2 = 300 boxes × €4 = **€1,200**.
- Total: **€2,400 per year**.

At the EOQ, ordering cost and holding cost are equal. This is a property of the Wilson formula.

### Step 5 — Ordering 1,000 at a time

- Ordering cost: (12,000 ÷ 1,000) × 60 = 12 × 60 = €720.
- Holding cost: (1,000 ÷ 2) × 4 = €2,000.
- Total: €2,720, i.e. **€320 more** (+13.3%).

The quantity is 67% larger, but the cost rises by only 13%. The total cost curve is flat around Q*: rounding to a pallet or a pack size costs little. What matters is being in the right order of magnitude.
