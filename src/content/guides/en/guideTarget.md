---
key: guideTarget
lang: en
summary:
  - 'The order-up-to level (target stock) is the inventory position you restore at every periodic review.'
  - 'Formula: order-up-to level = μ × (L + R) + safety stock, where μ is average demand per period.'
  - 'At each review, order the order-up-to level minus the inventory position (on hand + on order − backorders).'
  - 'Example: 250 units a week, 14-day lead time, weekly review and 95% service level give an order-up-to level of 921 units.'
published: '2026-11-20'
updated: '2026-11-20'
---

Not every business reorders the instant stock dips. Many review their inventory on a fixed rhythm (every Monday, every other Friday, when the supplier’s truck is due) and top items up in one go. The quantity they top up to is the **order-up-to level**, also called **target stock** or **replenishment level**. It is the core parameter of a **periodic review** (R, S) policy.

## Definition

The order-up-to level is the inventory position you aim for immediately after placing an order. At each review you measure the gap between that level and where you actually stand, and you order exactly that gap.

The level must carry you until the **next** order arrives: the current order’s lead time (L) plus the time until the next review (R). Hence:

```
Order-up-to level = μ × (L + R) + SS
```

- **μ**: average demand per period;
- **L** and **R**: lead time and review period, converted into the same period unit;
- **SS**: safety stock, also sized over L + R (see the [safety stock guide](/en/guides/safety-stock-formula/)).

## Inventory position, not on-hand stock

The order quantity is based on the **inventory position**, not on what you can see on the shelf:

```
Inventory position = on hand + open purchase orders − customer backorders
Order quantity = order-up-to level − inventory position (if positive)
```

Forgetting goods already on order is the classic error: you reorder what is already on its way, and stock creeps up with every cycle.

## A complete worked example

A consumable item has the following characteristics, measured on a year of weekly data:

| Parameter | Value |
|---|---|
| Average demand μ | 250 units / week |
| Standard deviation σ | 60 units / week |
| Supplier lead time L | 14 days = 2 weeks |
| Review period R | 7 days = 1 week |
| Target service level | 95% → Z = 1.6449 |

**Step 1 — safety stock.**

```
SS = 1.6449 × 60 × √(2 + 1) = 98.69 × 1.7321 = 170.94 → 171 units
```

**Step 2 — order-up-to level.**

```
Order-up-to level = 250 × (2 + 1) + 170.94 = 750 + 170.94 = 920.94 → 921 units
```

**Step 3 — Monday’s order.** At the review you have 380 units on hand, an open order of 200 units due on Thursday and no customer backorders. The inventory position is 380 + 200 − 0 = 580, so you order **921 − 580 = 341 units**.

**Step 4 — expected average stock.** In steady state, average on-hand stock is roughly SS + μ × R ÷ 2 = 171 + 125 ≈ **296 units**, a handy figure to estimate how much cash the policy ties up.

The [order-up-to level calculator](/en/calculators/target-stock/) reproduces this with your own values.

## How the review period changes things

What if you only order every two weeks (R = 2)?

- SS = 1.6449 × 60 × √(2 + 2) = 197.39 → 198 units;
- order-up-to level = 250 × 4 + 197.39 = 1,197.39 → 1,198 units;
- average stock ≈ 198 + 250 = 448 units.

Longer review periods save ordering effort and consolidate shipments, but here they add roughly 150 units of average stock. The right cadence balances ordering cost against holding cost.

## Choosing the review period in practice

The review period is rarely a free choice. It usually follows from constraints you can list:

- **supplier delivery days**: if the supplier ships once a week, reviewing daily brings little;
- **minimum order values or full-truck targets**: grouping items from one supplier into a single weekly order makes these easier to reach;
- **planning workload**: a buyer can review a few hundred items in depth each week, not several thousand each day;
- **item class**: high-value A items justify frequent reviews, while C items can wait two or four weeks.

Whatever cadence you choose, enter it as R so that both safety stock and the order-up-to level cover it. A review period that exists in practice but not in the formula is a hidden source of stock-outs.

## Order-up-to level vs reorder point

Both often live side by side in the same ERP:

| | Reorder point | Order-up-to level |
|---|---|---|
| Trigger | inventory position falls below a threshold | fixed calendar |
| Quantity | usually fixed (EOQ, pack multiple) | variable: top up to the level |
| Safety stock horizon | L | L + R |
| Typical use | continuously monitored items | consolidated orders per supplier, milk runs |

With continuous review (R = 0) the two formulas meet: the order-up-to level equals the [reorder point](/en/guides/reorder-point/).

## Assumptions and limits

The calculation assumes **stationary** demand (no strong trend) that is **roughly normal** over L + R. It therefore inherits the limits of safety stock:

- with **seasonality**, a yearly average gives a level that is too high in the slow season and too low in the peak. Recompute per season or on recent history;
- for **intermittent demand**, the result is an order of magnitude rather than a precise level;
- **buying constraints** (minimum order quantity, packs of 50) come on top: rounding orders up to the pack size raises average stock;
- history **understates demand during stock-outs**.

## Pitfalls to avoid

1. **Topping up from on-hand stock** instead of the inventory position.
2. **Sizing safety stock over L only** under periodic review, leaving the gap between reviews unprotected.
3. **Using the same “months of stock” target for every item**, regardless of variability.
4. **Ignoring items that stopped moving**: their level falls to zero, a signal to sell off or write down the remaining stock.

## For your entire range

[Stock-o-mètre](/en/) computes the order-up-to level of every item from your stock movements, compares it with current stock and highlights overstock in orange and understock in red. Lead time, review period and service level can be changed item by item with instant recalculation. No data ever leaves your computer.
