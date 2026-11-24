---
id: rop-beginner
lang: en
slug: reorder-point-beginner
title: 'Reorder point: when should you reorder?'
description: 'Calculate a reorder point, predict the day of the next order and see what safety stock does at the time of delivery.'
theme: rop
level: beginner
order: 1
minutes: 10
calc: calcRop
guide: guideRop
published: '2026-11-24'
updated: '2026-11-24'
---

## Problem

A spare parts store uses an average of **30 units per day** of a filter. The supplier delivers **8 days** after the order. Safety stock has already been set at **60 units**. No order is open.

1. Calculate the reorder point.
2. Stock today is 420 units. In how many days will you need to order?
3. If demand stays at the average, what will stock be just before the delivery arrives?

## Data

- Average demand d = 30 units per day.
- Lead time L = 8 days; safety stock SS = 60 units.
- Current stock: 420 units; no open order.
- Formula: ROP = d × L + SS.

## Solution

### Step 1 — Reorder point

```
ROP = 30 × 8 + 60 = 240 + 60 = 300 units
```

The 240 units cover average demand during the lead time; the 60 units cover the deviations.

### Step 2 — When to order

You need to use 420 − 300 = 120 units to reach the reorder point.

At 30 units per day: 120 ÷ 30 = **4 days**. The order goes out in 4 days.

### Step 3 — Stock at delivery

During the 8-day lead time, average demand is 30 × 8 = 240 units.

Stock just before delivery: 300 − 240 = **60 units**, exactly the safety stock.

That is what safety stock is for: if everything goes to plan, you never touch it. It is only used in weeks when demand runs above average or the supplier is late.
