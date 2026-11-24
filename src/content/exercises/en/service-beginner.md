---
id: service-beginner
lang: en
slug: service-level-measurement
title: 'Measuring service level: per cycle, by quantity, by order line'
description: 'From 10 replenishment cycles, calculate three different service levels and understand why they do not tell the same story.'
theme: service
level: beginner
order: 1
minutes: 15
calc: calcSafety
guide: guideService
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

Your manager asks for "the service level" of an item over the last 10 replenishment cycles (a cycle runs from one receipt to the next). You have the record below.

1. Calculate the **cycle service level**: the share of cycles that ended without a stockout.
2. Calculate the **fill rate**: the share of the quantity demanded that was served immediately from stock.
3. Calculate the **order line fill rate**: the share of customer order lines served in full.
4. Your manager reads "80%" and calls it a disaster. What do you answer?

## Data

| Cycle                     | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quantity demanded         | 380 | 420 | 410 | 450 | 390 | 370 | 400 | 430 | 360 | 390 |
| Quantity short (stockout) | 0   | 0   | 0   | 30  | 0   | 0   | 0   | 12  | 0   | 0   |

Over the same period, 250 customer order lines included this item; 6 could not be served in full.

## Solution

### Step 1 — Cycle service level

Two cycles had a stockout (cycles 4 and 8); 8 cycles out of 10 ended without one.

Cycle service level = 8 ÷ 10 = **80%**.

### Step 2 — Fill rate

Quantity demanded: 4,000 units. Quantity short: 30 + 12 = 42 units.

Fill rate = 1 − 42 ÷ 4,000 = 1 − 0.0105 = **98.95%**.

### Step 3 — Order line fill rate

Order line fill rate = (250 − 6) ÷ 250 = 244 ÷ 250 = **97.6%**.

### Step 4 — How to read these figures

The three figures describe the same reality but measure different things:

- **80%** says that there was a stockout, however short, in 2 cycles out of 10. This is the measure used to size safety stock (the Z factor).
- **98.95%** says that almost all of the quantity was served on time.
- **97.6%** is the closest to what the customer experiences: 6 lines out of 250 were incomplete.

Before calling it a disaster, you need to say which service level you mean. A service target must always state its definition; otherwise two people can both be right with opposite figures.
