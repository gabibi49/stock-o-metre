---
key: methodology
lang: en
updated: '2026-11-20'
---

This page describes exactly what Stock-o-mètre computes, step by step, with the assumptions and limits of each step. The code is tested against hand-calculated examples.

## Notation

| Symbol  | Meaning                                                                 |
| ------- | ----------------------------------------------------------------------- |
| d       | consumption (issues) of an item over one period                         |
| μ       | mean consumption per period                                             |
| σ       | sample standard deviation of consumption per period (n − 1 denominator) |
| n       | number of periods analysed for the item                                 |
| L, R    | lead time and review period, in days                                    |
| Lp, Rp  | L and R converted to periods: days ÷ 7 (week) or days ÷ 30.4375 (month) |
| σL, σLp | lead time standard deviation, in days then in periods                   |
| Z       | standard normal quantile for the service level                          |
| SS      | safety stock                                                            |

30.4375 days is the average length of a month (365.25 ÷ 12).

## 1. Reading the file

- **Encoding**: UTF-8 (with or without BOM), UTF-16 with BOM, otherwise Windows-1252.
- **Delimiter**: semicolon, comma or tab, detected on the first 50 lines (the chosen delimiter appears the same number of times on at least 80% of lines and yields the most columns).
- **Numbers**: decimal comma or point, detected on a sample; spaces, non-breaking spaces and apostrophes accepted as thousands separators; leading or trailing minus sign, accounting parentheses. A value that is ambiguous for the detected format (such as “1.5” in a decimal-comma file) is rejected rather than misread.
- **Dates**: dd/mm/yyyy, dd.mm.yyyy, dd-mm-yyyy, yyyy-mm-dd, yyyy/mm/dd, mm/dd/yyyy, with or without time. Only the calendar date is used (no time zone). When the sample cannot tell dd/mm from mm/dd, the tool asks you. Impossible dates (31/02) are rejected.
- **Rejected rows**: unreadable date, quantity or item code. They are counted and the first one is quoted with its line number.
- **Limits**: 50 MB, 2 million rows, 50,000 items.

## 2. Movement types and quantity signs

You classify each value of the type column as **receipt**, **issue** (consumption), **adjustment** (changes rebuilt stock without being consumption) or **ignore**.

Some systems export issues as negative numbers, others as positive. For each type classified as receipt or issue, the tool takes the **majority sign** of its quantities as the normal direction. A row with the opposite sign (a return, for instance) is deducted. Adjustments keep their sign as is.

Without a type column: negative quantity = issue, positive = receipt, zero = ignored.

Unit price and current stock are the latest valid value by date. Strictly identical rows (all columns) are counted as duplicates: they stay in the calculation, since two identical issues on the same day may be genuine, but the item is flagged.

## 3. Aggregation by period

- Consumption is **summed per item and per period** (ISO week, Monday to Sunday, or calendar month).
- **Every period** between the item’s first period and the end of the file is present, **including periods with no issues**, which count as 0. Without them, intermittent demand would look regular.
- An item’s series starts at its **first movement** in the file (not at the start of the file), so an item launched part-way through is not penalised by months of “zero demand” before it existed.
- A period is only kept if **the file covers it entirely**, between the first and last dates of the file. The last period (current period) is dropped if the file stops before its end; the first is dropped if the file starts after its beginning. Both cases are reported.
- A period with a negative total (more returns than issues) counts as 0.

## 4. Statistics

```
μ = Σ d / n
σ = √( Σ (d − μ)² / (n − 1) )        (σ = 0 if n < 2)
CV = σ / μ                             (undefined if μ = 0)
```

## 5. Safety factor Z

Z is the standard normal quantile for the target cycle service level, computed with Peter J. Acklam’s algorithm (relative error below 1.2 × 10⁻⁹). Tested reference values: 90% → 1.2816; 95% → 1.6449; 98% → 2.0537; 99% → 2.3263. The service level is bounded between 50% and 99.99%.

By default, the target depends on the item’s ABC class: A 98%, B 95%, C 90%.

## 6. Safety stock: three methods

**Variable demand** (default):

```
SS = Z × σ × √(Lp + Rp)
```

**Variable demand and lead time** (when σL is provided):

```
SS = Z × √( (Lp + Rp) × σ² + μ² × σLp² )
```

With σL = 0 this gives the same result as the previous formula.

**Simple cover**:

```
SS = (μ ÷ days per period) × days of cover
```

## 7. Reorder point and order-up-to level

```
Reorder point     = μ × Lp + SS
Order-up-to level = μ × (Lp + Rp) + SS
```

Under continuous review (R = 0) they are equal. Because safety stock is sized over Lp + Rp, it also covers the time between two reviews.

## 8. Rounding

Safety stock, reorder point and order-up-to level are **rounded up to the next unit** in the table and the export (with a 10⁻⁹ tolerance so that floating-point noise such as 24.000000000000004 does not become 25). Charts use exact values.

## 9. ABC and XYZ classes

**ABC**: on consumption value over the analysed period (quantity × unit price) when a price column exists, otherwise on quantity. Items are sorted by decreasing value. An item is classified by the cumulative share **before** it: A if below the A threshold (80% by default), B if below A + B (95%), otherwise C. The first item is therefore always A, and a zero-value item always C. An item without a price while a price column exists is ranked with a zero value and flagged.

**XYZ**: X if CV < 0.5; Y if 0.5 ≤ CV ≤ 1; Z if CV > 1 (adjustable thresholds). No class when μ = 0.

## 10. Rebuilt stock and cover

With a current stock (column in the file or entered in the table), the tool walks back in time by undoing movements:

```
stock at end of day j = current stock − Σ (net movements after day j)
```

Without current stock, stock starts at 0 at the beginning of the file: the curve is then **relative**, only its changes are meaningful. Periods where stock is less than or equal to 0 are highlighted as stock-outs.

```
Current cover (days) = current stock ÷ (μ ÷ days per period)
Gap to target        = current stock − rounded order-up-to level
```

A positive gap is overstock (orange), a negative gap understock (red).

## 11. Alerts

| Alert                  | Condition                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------- |
| Short history          | fewer than 8 periods analysed                                                                     |
| Intermittent demand    | more than 30% of periods at zero: the normal distribution is unreliable                           |
| Negative rebuilt stock | with a known current stock, rebuilt stock drops below 0: missing movements or wrong current stock |
| No demand              | μ = 0                                                                                             |
| Duplicates             | strictly identical rows in the file                                                               |
| Missing price          | a price column is mapped but the item has no valid price                                          |

## Assumptions and limits

- **Stationary demand**: mean and spread are stable over the history. Trends and seasonality inflate σ and misstate levels by season. Use recent history, or analyse peak and off-peak separately.
- **Normally distributed** demand over Lp + Rp, with **independent** periods. Reasonable for fast movers; approximate for slow or intermittent items (dedicated alert).
- **Cycle service level**: the probability of no stock-out between two deliveries. It is not the fill rate (share of demand served), which is usually higher.
- **Censored demand**: during stock-outs, issues are zero although demand existed, so history understates demand.
- **Buying constraints are ignored**: minimum order quantity, pack sizes, economic order quantity, storage capacity.
- **Same lead time and review period for every item**, unless changed item by item.
- **File range**: the first and last dates in the file (all movements) define which periods are complete.

The tool supports decisions; it does not make them. Review the results, especially for flagged items, before changing your replenishment settings.
