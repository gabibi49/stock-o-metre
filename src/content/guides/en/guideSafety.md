---
key: guideSafety
lang: en
summary:
  - 'Safety stock protects you against demand above average during the replenishment lead time.'
  - 'Core formula: SS = Z × σ × √(L + R), where σ is the standard deviation of demand per period, and L and R are the lead time and review period in that same period unit.'
  - 'Worked example: 12 weeks of history, 10-day lead time, weekly review and a 95% service level give a safety stock of 49 units.'
  - 'The formula assumes stable, roughly normal demand. Treat its output with care for intermittent or strongly seasonal items.'
published: '2026-11-20'
updated: '2026-11-20'
---

Every inventory planner knows the tension: hold too little and customers wait; hold too much and cash sits on shelves. Safety stock is the buffer that resolves that tension in a measurable way. Instead of a gut-feel “two weeks extra”, you decide how often you are willing to run out, and the formula tells you how many units that takes for each item.

## What the buffer is for

Once you place a purchase order, nothing arrives until the **lead time L** has passed. If you only check stock at fixed intervals, you must also last until the next check: the **review period R**. During those L + R days you will consume, on average, μ × (L + R). That average is not the job of safety stock; the reorder point and the order-up-to level already include it. Safety stock covers the **portion of demand above the average**.

How large that portion can get depends on:

- how **variable** demand is, measured by its standard deviation σ;
- how much **protection** you want, expressed as a Z-score derived from the service level.

## The standard formula

When lead time is reliable and only demand fluctuates:

```
SS = Z × σ × √(L + R)
```

- **σ** is the standard deviation of demand **per period** (per week or per month), computed from history.
- **L** and **R** must be expressed **in the same period unit** as σ. With weekly data, a 10-day lead time is 10 ÷ 7 = 1.43 weeks.
- **Z** is the standard normal quantile for your target service level: 1.2816 for 90%, 1.6449 for 95%, 2.0537 for 98%, 2.3263 for 99%.

Why the square root? If demand in one week does not depend on demand in another, **variances add up**. Over 2.43 weeks the variance is 2.43 × σ², so the standard deviation is σ × √2.43. Uncertainty grows more slowly than time: doubling the lead time multiplies safety stock by √2 ≈ 1.41, not by 2.

The service level in this formula is the **cycle service level**: the probability of not running out between two deliveries. It is not the share of demand served from stock (the fill rate), which is usually much higher. The guide on [choosing a service level by class](/en/guides/service-level-by-class/) explains the difference.

## A complete worked example

A fastener has the following weekly issues over the last 12 weeks:

| Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Units issued | 120 | 95 | 140 | 110 | 130 | 85 | 150 | 105 | 125 | 115 | 100 | 125 |

**Step 1 — mean.** Total issues are 1,400 units, so μ = 1,400 ÷ 12 = **116.67 units per week**.

**Step 2 — standard deviation.** Take each week’s difference from the mean, square it and add the squares: the sum is 3,916.67. Divide by n − 1 = 11 (sample standard deviation): the variance is 356.06, so σ = √356.06 = **18.87 units**.

**Step 3 — convert lead time and review period.** The supplier delivers in 10 days and you order every Monday: Lp = 10 ÷ 7 = **1.4286 weeks** and Rp = 7 ÷ 7 = **1 week**. Hence √(Lp + Rp) = √2.4286 = **1.5584**.

**Step 4 — Z-score.** For a 95% service level, Z = **1.6449**.

**Step 5 — safety stock.**

```
SS = 1.6449 × 18.87 × 1.5584 = 48.37 → 49 units
```

Always round up to the next whole unit. With that buffer, the [reorder point](/en/guides/reorder-point/) is 116.67 × 1.4286 + 48.37 = 215.04, i.e. 216 units, and the [order-up-to level](/en/guides/order-up-to-level/) is 116.67 × 2.4286 + 48.37 = 331.70, i.e. 332 units.

Try your own numbers in the [safety stock calculator](/en/calculators/safety-stock/).

## When lead time varies too

Suppliers are rarely perfectly punctual. If deliveries take anywhere between 8 and 13 days, lead time itself becomes a source of risk. With σL the standard deviation of the lead time:

```
SS = Z × √((L + R) × σ² + μ² × σL²)
```

Back to the example, with σL = 3 days, i.e. σLp = 3 ÷ 7 = 0.4286 weeks:

- demand term: 2.4286 × 356.06 = 864.72;
- lead time term: 116.67² × 0.4286² = 2,500.00;
- SS = 1.6449 × √3,364.72 = 1.6449 × 58.01 = 95.41 → **96 units**.

Three days of delivery uncertainty almost double the buffer. Working with a supplier on reliability often pays off more than polishing forecasts.

## The “days of cover” shortcut

Many companies simply hold “five days of stock” as a buffer. Here, 116.67 ÷ 7 = 16.67 units per day, so five days is 83.3, rounded up to 84 units. It is easy to explain, but it ignores variability: a perfectly steady item and an erratic one get the same protection in days. It is a reasonable starting point for new items without history, not a long-term policy.

## Assumptions and limits

The formula is only as good as its assumptions:

- **Stationary demand**: the mean and spread do not drift over the history you use. Trends and strong seasonality inflate σ.
- **Normal distribution**: demand over L + R is roughly bell-shaped. That holds for fast movers, much less for slow movers.
- **Independence** between periods.
- **Observed demand equals true demand**: during a stock-out, issues drop to zero although customers still wanted the item, so history underestimates demand.

For **intermittent demand** (more than 30% of periods with no issues at all), the normal distribution is a poor fit and the result is only a rough guide. Poisson-based models or Croston’s method are better suited.

## Common mistakes

1. **Dropping zero-demand periods.** Keeping only weeks with issues makes demand look smooth and underestimates σ.
2. **Mixing units**, such as a monthly σ with a lead time in weeks.
3. **Using max minus min** instead of the standard deviation.
4. **One service level for everything**, when an [ABC-XYZ analysis](/en/guides/abc-xyz-analysis/) lets you spend your inventory budget where it matters.
5. **Never recalculating.** Demand changes; review buffers at least every quarter.

## Scale it to your whole catalogue

Working one item by hand builds intuition; doing it for 3,000 SKUs does not. [The Stock-o-mètre tool](/en/) reads your stock movement export (CSV), rebuilds demand per week or month including zero periods, and computes safety stock, reorder point and order-up-to level for every item. Your file is processed in your browser and never uploaded.
