---
key: guideRop
lang: en
summary:
  - 'The reorder point is the inventory position that triggers a new purchase order.'
  - 'Formula: reorder point = average demand × lead time + safety stock.'
  - 'Example: 18 units a day, 12-day lead time, 97.5% service level give a reorder point of 257 units.'
  - 'Always compare the reorder point with the inventory position (on hand + on order), never with on-hand stock alone.'
published: '2026-11-20'
updated: '2026-11-20'
---

The reorder point (ROP) answers the most practical question in inventory control: **at what stock level should I place the next order?** Set it too high and you order early, so stock piles up. Set it too low and the delivery lands after the shelf is empty. The right threshold carries you through the lead time, with a calculated margin for bad luck.

## The formula

Under **continuous review**, where stock is monitored at every transaction (as most ERPs do):

```
Reorder point = μ × L + SS
```

- **μ × L** is the average demand during the lead time, which you expect to consume while waiting for the delivery;
- **SS** is safety stock, which covers demand above that average over the same lead time.

μ and L must share a unit: daily demand with a lead time in days, or weekly demand with the lead time converted to weeks (10 days = 10 ÷ 7 = 1.43 weeks).

## A complete worked example

A filter sells on average **18 units per working day**, with a daily standard deviation of **6 units**. The supplier delivers in **12 working days**. The item matters to customers, so you target a **97.5%** service level, i.e. Z = **1.96**.

**Step 1 — demand during lead time.**

```
μ × L = 18 × 12 = 216 units
```

**Step 2 — safety stock.** The exposure period is the lead time alone (continuous review, R = 0):

```
SS = 1.96 × 6 × √12 = 1.96 × 6 × 3.4641 = 40.74 → 41 units
```

**Step 3 — reorder point.**

```
Reorder point = 216 + 40.74 = 256.74 → 257 units
```

**Step 4 — in practice.** Filters are bought in lots of 300. On Monday the inventory position is 420 units with nothing on order. At the average rate it reaches 257 units after (420 − 257) ÷ 18 ≈ 9 days, so the order goes out around day 10. It lands 12 days later; in the average case about 41 units, the safety stock, remain on the shelf when the lot of 300 arrives.

**Step 5 — average stock.** With fixed lots, average on-hand stock is roughly SS + Q ÷ 2 = 41 + 150 = **191 units**.

Check your own figures with the [reorder point calculator](/en/calculators/reorder-point/).

## Why the inventory position matters

The trigger must be compared with the **inventory position**:

```
Inventory position = on hand + open purchase orders − customer backorders
```

If you only look at on-hand stock, the threshold stays crossed until the delivery arrives and the system reorders every single day. This matters even more when demand during the lead time exceeds the lot size, because several orders are then in transit at once.

## Reorder points with periodic review

If you only check stock once a week, an item may cross its threshold on Tuesday without anyone noticing until the following Monday. Two remedies:

- include the review period in both safety stock and threshold (the trigger becomes μ × (L + R) + SS), which is effectively an [order-up-to policy](/en/guides/order-up-to-level/);
- or move to continuous review with ERP alerts.

In the Stock-o-mètre tool, the reorder point is always computed over L and the order-up-to level over L + R. With R = 0 they are identical.

## Where the inputs come from

- **μ and σ**: from issue history aggregated by day, week or month, **keeping periods with zero issues**. Twelve to twenty-four months is a sensible window.
- **L**: from actual lead times observed (receipt date minus order date) rather than the supplier’s quoted lead time. Add inspection and put-away time.
- **Service level**: a management decision, ideally differentiated by item class (see [choosing a service level by class](/en/guides/service-level-by-class/)).

If lead times vary noticeably, use the safety stock formula that includes lead time variability, explained in the [safety stock guide](/en/guides/safety-stock-formula/).

## Assumptions and limits

- **Stationary demand**: the reorder point relies on a past average. If demand grows by 30%, the trigger becomes too low.
- **Normal distribution**: fine for fast movers; approximate for intermittent items.
- **Multiple open orders**: the formula still holds, provided you reason in inventory position.
- **Cycle service level**: 97.5% means roughly one replenishment cycle in 40 will see a stock-out, however short. It does not mean 97.5% of demand is served.
- **Lost sales**: during stock-outs issues drop to zero, so history understates true demand.

## Common mistakes

1. Setting the trigger by gut feel once and never revisiting it as demand changes.
2. Forgetting safety stock, or counting it twice (in the trigger and in a separate “minimum stock”).
3. Using the contractual lead time instead of the observed one.
4. Comparing the trigger with on-hand stock instead of the inventory position.

## When to recalculate

A reorder point is a snapshot of past behaviour, so it ages. Recalculate it:

- **every quarter** as a routine, on a rolling 12-month window;
- **after a structural change**: a new customer, a lost contract, a product replacing another, a price change that shifts demand;
- **when the supplier changes**, or when its actual lead times drift from what you assumed;
- **after a run of stock-outs**, keeping in mind that lost sales hide part of the true demand, so the new average may still be too low.

Between two recalculations, watch two warning signs: the item hits its safety stock much more often than once in forty cycles, or it never comes close to it. The first means the trigger is too low, the second that it is too high.

## For your whole catalogue

[The Stock-o-mètre tool](/en/) calculates the reorder point of every item from a CSV export of your stock movements and shows how many items are currently below it. Everything runs in your browser: your file is never sent anywhere.
