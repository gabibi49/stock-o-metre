---
key: guideService
lang: en
summary:
  - 'Cycle service level is the probability of not running out between two deliveries; it sets the Z-score in the safety stock formula.'
  - 'Safety stock rises steeply near 100%: going from 95% to 99% adds 41% more safety stock.'
  - 'Differentiating by ABC class (for example A 98%, B 95%, C 90%) puts inventory where it matters most.'
  - 'Worked example: three items with identical variability but different unit costs, and what each extra point of service costs.'
published: '2026-11-20'
updated: '2026-11-20'
---

“We want 100% availability.” It sounds reasonable until you do the maths: with uncertain demand, guaranteeing zero stock-outs would require infinite stock. The real job is to **choose an acceptable level of risk**, item by item or class by class, knowing what it costs.

## Which service level?

Two different metrics often share the name:

- **cycle service level** (CSL): the probability that a replenishment cycle ends without a stock-out. This is the one in SS = Z × σ × √(L + R);
- **fill rate**: the share of demand served immediately from stock.

They are not the same number. Take an item whose demand over the lead time has a standard deviation of 100 units, ordered in lots of 500. At a 95% cycle service level, the normal distribution gives an expected shortage of about 2.1 units per cycle, i.e. a fill rate of 1 − 2.1 ÷ 500 ≈ **99.6%**. So 95% CSL is not poor performance; it does not mean that 5% of customers leave empty-handed.

## What each point of service costs

The Z-score is a quantile of the normal distribution. It does not grow in a straight line:

| Service level | Z | Safety stock relative to 95% |
|---|---|---|
| 80% | 0.8416 | 51% |
| 90% | 1.2816 | 78% |
| 95% | 1.6449 | 100% |
| 97.5% | 1.9600 | 119% |
| 98% | 2.0537 | 125% |
| 99% | 2.3263 | 141% |
| 99.5% | 2.5758 | 157% |
| 99.9% | 3.0902 | 188% |

From 90% to 95% you add 28% safety stock. From 95% to 99% you add 41%. The last points are the expensive ones.

## A complete worked example

Three items share the same uncertainty: σ × √(L + R) = **100 units**. They differ only in unit cost and ABC class:

| Item | Class | Unit cost | Target | Z | Safety stock | Value |
|---|---|---|---|---|---|---|
| Pump | A | €40 | 98% | 2.0537 | 205.4 → 206 | €8,240 |
| Seal | B | €15 | 95% | 1.6449 | 164.5 → 165 | €2,475 |
| Clamp | C | €4 | 90% | 1.2816 | 128.2 → 129 | €516 |

With a 25% annual holding cost rate (capital, insurance, space, obsolescence), the pump’s safety stock costs about 8,240 × 0.25 = **€2,060 a year**.

Now compare two possible decisions:

- **Raise the pump from 98% to 99%**: 233 − 206 = 27 extra units, i.e. €1,080 of stock and €270 a year.
- **Raise the clamp from 90% to 98%**: 206 − 129 = 77 extra units, i.e. €308 of stock and €77 a year.

The second buys much more reliability for much less money. That is the point of reasoning by class.

## Two ways to differentiate

**Approach 1 — protect revenue.** A items drive most of consumption, so a stock-out there costs the most in lost sales. Give them the highest target: **A 98%, B 95%, C 90%**. These are Stock-o-mètre’s default values, and you can change them.

**Approach 2 — save where stock is expensive.** C items are cheap to hold, so a high target costs almost nothing and saves you from firefighting hundreds of small shortages. You may then aim for **C 98–99%** and fine-tune A items, where the money is tied up.

Both approaches are defensible. The right one depends on what a stock-out really costs you: a lost customer, a stopped production line, or a slightly delayed delivery? Many companies blend them: high targets for **steady** A items (AX), high targets for cheap C items, and moderate targets for expensive, erratic items (AZ), which are handled case by case.

## A four-step method

1. **Classify your items** with ABC and XYZ (see the [ABC-XYZ analysis guide](/en/guides/abc-xyz-analysis/)).
2. **Start from a simple grid** such as A 98%, B 95%, C 90%, with exceptions for critical items (safety parts, items without substitutes).
3. **Compute the resulting safety stock** and its total value. If it exceeds your budget, cut first where the marginal cost is highest.
4. **Measure** the service level actually achieved over a few months, then adjust.

For **intermittent** items (class Z), the normal distribution fits demand poorly, so the stated service level is only indicative. Prefer a manual review.

## Talking about service levels internally

Service level targets often fail because sales, purchasing and finance each read them differently. A few habits help:

- **Name the metric.** Write “95% cycle service level” rather than “95% service”, and report fill rate separately if customers care about it.
- **Show the price tag.** Present each option with its safety stock value and yearly holding cost, as in the table above. Debates become much shorter.
- **Agree on exceptions in writing.** A short list of critical items with their own target avoids endless one-off requests.
- **Review together once a quarter**, using the service level actually achieved per class rather than anecdotes about the last stock-out.

## Assumptions and limits

- Mapping a service level to Z assumes **normal**, **stationary** demand over L + R.
- Cycle service level ignores **lot size**: bigger lots mean fewer cycles, hence fewer opportunities to run out each year.
- **Past stock-outs** distort history, because unmet demand never shows up as issues.
- A service level is a **statistical target**: over a quarter, the observed rate will fluctuate around it.

## Try it on your items

The [safety stock calculator](/en/calculators/safety-stock/) shows the effect of a different service level on one item instantly. For your whole range, [Stock-o-mètre](/en/) applies a target per ABC class that you can change globally or item by item, and recomputes safety stock, reorder point and order-up-to level instantly, without your data ever leaving your computer.
