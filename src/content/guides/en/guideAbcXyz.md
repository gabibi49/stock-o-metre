---
key: guideAbcXyz
lang: en
summary:
  - 'ABC analysis ranks items by consumption value (the Pareto principle): A items are the few that make up most of the value.'
  - 'XYZ analysis ranks items by demand regularity, measured with the coefficient of variation σ / μ.'
  - 'Together they form a nine-cell matrix that guides service levels, review frequency and forecasting effort.'
  - 'Example: out of 10 items, 4 A items account for 85% of consumption value.'
published: '2026-11-20'
updated: '2026-11-20'
---

Running 5,000 SKUs on one set of rules means treating a component worth €200,000 of annual consumption exactly like a washer worth €30. ABC-XYZ analysis exists to **focus attention and inventory where they pay off**. It combines two questions: *how much does this item matter?* (ABC) and *how predictable is its demand?* (XYZ).

## ABC analysis: value

ABC analysis applies the Pareto principle: a small share of items represents most of the value consumed.

1. For each item, compute **consumption value** over the period: quantity issued × unit cost (purchase or standard cost). Without prices you can rank by quantity, keeping in mind that this mixes cheap and expensive items.
2. Sort items by decreasing value.
3. Compute the **cumulative share** of value.
4. Assign classes using thresholds, typically **80 / 15 / 5%**: items making up the first 80% of value are A, the next 15% B, the rest C.

One detail matters: what about the item that straddles the 80% line? Stock-o-mètre looks at the cumulative share **before** the item. If it starts below 80%, it is an A. As a result, the most valuable item is always an A, even if it alone accounts for 90% of the total.

## XYZ analysis: regularity

XYZ analysis uses the **coefficient of variation** (CV) of demand per period:

```
CV = σ / μ
```

The CV measures spread relative to the mean: a standard deviation of 20 on an average of 100 (CV = 0.2) is far steadier than 20 on an average of 10 (CV = 2). Common thresholds:

| Class | CV | Profile |
|---|---|---|
| X | below 0.5 | steady, easy to forecast |
| Y | 0.5 to 1 | fluctuating (seasonality, promotions) |
| Z | above 1 | erratic or intermittent |

The CV depends on the aggregation period: it is usually lower with monthly data than with weekly data, because fluctuations cancel out. Compare items computed on the same period, and **keep zero-demand periods**. An item that only moves one week in four must show up as irregular.

## A complete worked example

Ten items with their 12-month consumption value (in thousands of euros) and the CV of their weekly demand:

| Item | Value (k€) | Share | Cumulative before | ABC | CV | XYZ |
|---|---|---|---|---|---|---|
| P1 | 420 | 42% | 0% | A | 0.20 | X |
| P2 | 260 | 26% | 42% | A | 0.60 | Y |
| P3 | 110 | 11% | 68% | A | 1.40 | Z |
| P4 | 60 | 6% | 79% | A | 0.30 | X |
| P5 | 50 | 5% | 85% | B | 0.45 | X |
| P6 | 40 | 4% | 90% | B | 0.80 | Y |
| P7 | 25 | 2.5% | 94% | B | 1.60 | Z |
| P8 | 15 | 1.5% | 96.5% | C | 0.25 | X |
| P9 | 12 | 1.2% | 98% | C | 0.90 | Y |
| P10 | 8 | 0.8% | 99.2% | C | 2.10 | Z |

Total: €1,000k. P4 starts at 79%, below the 80% line, so it is an A. The **4 A items carry 85%** of the value, the 3 B items 11.5% and the 3 C items 3.5%.

For the CV, take the item from the [safety stock guide](/en/guides/safety-stock-formula/): μ = 116.67 and σ = 18.87 per week, so CV = 18.87 ÷ 116.67 = 0.16, which makes it an X.

## The ABC-XYZ matrix

| | X (steady) | Y (fluctuating) | Z (erratic) |
|---|---|---|---|
| **A** | High service level, carefully sized safety stock, frequent review. Low stock because demand is predictable. | Close watch on seasonality, frequent parameter updates. | High stakes and unpredictable: talk to customers, short supplier contracts, possibly make-to-order. |
| **B** | Standard parameters, regular review. | Standard parameters, quarterly recalculation. | Check whether demand is truly erratic or driven by a few large orders. |
| **C** | Automate: bigger lots, less frequent reviews. | Automate, accept a little more stock. | Candidates for delisting or order-on-demand. |

P1 (AX) is the dream item: high value, stable demand. Tightly sized safety stock pays off handsomely. P3 (AZ) is the risky one: high value, erratic demand. The textbook safety stock formula is unreliable there and human judgement is needed. P10 (CZ) is cheap and unpredictable, so it is worth asking whether it should be stocked at all.

## Using the classification well

- **Refresh it** at least yearly, ideally every quarter: items move between classes.
- **Do not confuse value with importance**: a C item can be critical (a safety part, a traffic-building product). Keep the option to set a service level manually.
- **Differentiate service levels by class**, the most direct use of the analysis. The guide on [choosing a service level by class](/en/guides/service-level-by-class/) suggests a method.

## Assumptions and limits

- Consumption value depends on the **price used**: latest purchase cost, weighted average cost or selling price give different rankings.
- The CV requires a **non-zero mean**: an item with no consumption has no XYZ class.
- A high CV may come from a known **trend** or **seasonality**, which is predictable, not only from randomness. Look at the chart before concluding.
- The 80/15/5 and 0.5/1 thresholds are **conventions**, not laws. Adapt them to your business.

## Classify automatically

[Stock-o-mètre](/en/) computes ABC (by value when a price column is present, otherwise by quantity) and XYZ classes for all your items, with adjustable thresholds, a Pareto chart and class filters. Processing is local, so your data never leaves your computer. For a one-off check, the [safety stock calculator](/en/calculators/safety-stock/) is enough.
