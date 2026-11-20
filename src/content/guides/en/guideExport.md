---
key: guideExport
lang: en
summary:
  - 'Safety stock and target stock calculations need your stock movement history: date, item, quantity, and ideally movement type, unit cost and current stock.'
  - 'Export 12 to 24 months, ending on the last day of a complete period (end of week or end of month).'
  - 'Classify movement types carefully: only consumption issues count as demand.'
  - 'Watch out for spreadsheets: leading zeros in codes, converted dates, decimal separators.'
published: '2026-11-20'
updated: '2026-11-20'
---

Every business system (ERP, WMS, point of sale, order management) logs stock movements: receipts, issues, transfers, stock counts. That log is the raw material for safety stock calculations. This guide explains how to turn it into a clean CSV file, whatever software you use.

## What to extract

Look for a report or query called something like “stock movement history”, “inventory transactions” or “item ledger”, with one row per movement.

| Column | Required | Content |
|---|---|---|
| date | yes | movement date (dd/mm/yyyy, mm/dd/yyyy or yyyy-mm-dd; time allowed) |
| item | yes | item code, identical across rows |
| quantity | yes | movement quantity |
| movement_type | recommended | receipt, sale, production issue, stock count… |
| description | optional | item description |
| unit_price | recommended | unit cost, for value-based ABC analysis |
| current_stock | recommended | stock at export date, repeated on each row or at least once per item |

Column names do not have to match: the tool recognises common synonyms (“qty”, “SKU”, “posting date”, “on hand”…) and lets you fix the mapping. A [CSV template](/movements-template.csv) is available.

## Which time span

- **Length**: 12 to 24 months. Fewer than 8 periods is not enough to estimate variability; more than two years often mixes situations that no longer exist.
- **End**: stop the export on the **last day of a complete period** (Sunday night for weekly analysis, month end for monthly). The tool drops the last period when the file stops before its end, so that it is not mistaken for a slow period.
- **Start**: likewise, start on a Monday or on the first of a month.

## Handling movement types

Only **consumption issues** (sales, production issues, shipments to customers) measure demand. Other movements change stock without being demand:

- **supplier receipts, production output**: receipts;
- **stock counts, corrections**: adjustments, which count when rebuilding stock but not as consumption;
- **inter-warehouse transfers**: depends on scope. When analysing a single warehouse, an outbound transfer is demand for that warehouse. When analysing the whole company, ignore it;
- **customer returns**: they reduce consumption, provided they are classified with issues (the tool takes the sign into account).

If your export has no type column, the rule is simple: negative quantity = issue, positive quantity = receipt.

## A complete worked example

Here is an extract for one item, exported from Monday 6 to Friday 31 January 2025, with a current stock of 132 units:

| date | item | quantity | movement_type |
|---|---|---|---|
| 2025-01-06 | SCREW-M8 | 500 | Receipt |
| 2025-01-07 | SCREW-M8 | 120 | Sale |
| 2025-01-09 | SCREW-M8 | 95 | Sale |
| 2025-01-14 | SCREW-M8 | 140 | Sale |
| 2025-01-16 | SCREW-M8 | −3 | Stock count |
| 2025-01-27 | SCREW-M8 | 110 | Sale |

**Step 1 — weekly consumption.** Week of 6 Jan: 120 + 95 = 215. Week of 13 Jan: 140. Week of 20 Jan: **0** (no sales). Week of 27 Jan: 110, but the file ends on Friday 31, so that week is incomplete and excluded.

**Step 2 — why the zero week matters.** Over the three complete weeks (215, 140, 0), the mean is 118.33 and the standard deviation 109.13, a coefficient of variation of 0.92: irregular demand. Forget the empty week and you get a mean of 177.5 and a standard deviation of 53.03 (CV 0.30): an item that looks steady, and an underestimated safety stock.

**Step 3 — rebuilt stock.** Net movements add up to 500 − 120 − 95 − 140 − 3 − 110 = +32. With current stock at 132, opening stock was 100. Row by row: 600, 480, 385, 245, 242, then 132. If any value went negative, movements would be missing from the export.

Three weeks is of course far too short for a reliable calculation, and the tool would flag a “short history”. The extract only illustrates how the data is processed.

## Spreadsheet traps

If the data goes through a spreadsheet before being saved as CSV:

- **leading zeros**: code “00125” becomes 125. Format the column as text before pasting;
- **dates**: the spreadsheet may swap day and month or turn dates into serial numbers (45678). Spot-check a few rows;
- **long numeric codes** shown in scientific notation (1.23E+12): format as text;
- **separators**: a European spreadsheet saves CSV with semicolons and decimal commas. The tool detects both formats, as well as the encoding (UTF-8 or Windows-1252);
- **total rows** appended at the bottom of a report: delete them.

## Checks before analysis

1. **Totals**: compare an item’s total issues with the consumption your system reports for the same period.
2. **Stock**: rebuilt stock must land on current stock; negative stock means missing movements.
3. **Duplicates**: a row exported twice doubles consumption. The tool flags strictly identical rows.
4. **Units of measure**: an item counted in cartons here and in pieces there breaks everything. Export in the stocking unit.
5. **Personal data**: the calculation does not need any. Remove customer or employee names from the export.

## File size

Movement files easily exceed a million rows. The tool accepts up to 50 MB, 2 million rows and 50,000 items. Beyond that, split by product family or warehouse.

## Run the analysis

Once your export is ready, load it into [the Stock-o-mètre tool](/en/): it suggests a column mapping, lets you classify movement types, then computes safety stock, reorder point and order-up-to level for every item. The file stays on your computer. To check a single item, the [days of cover calculator](/en/calculators/days-of-cover/) tells you instantly how long your current stock will last.
