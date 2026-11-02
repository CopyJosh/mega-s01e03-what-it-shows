The shared parser reads day-first dates as month-first dates.

Reports covered: **379 unique reports** from the 2026-10-04 export, after deduplication by report ID.

For a tenant whose locale writes the day first, app/email reports and booking-v2 form reports reach the month-first shared parser. Dates with ambiguous day and month values can change month and day. For example, R-41200 from harbour.dental reports 7 April becoming 4 July. The tenant uses en-GB and booking-v2.

Evidence: `src/lib/kb/causes.ts` (`dayFirst`, `causeOf`, `uniqueById`, `groupByCause`), the tenant directory, and `src/lib/data/reports-4471.json`. All these reports were merged into the combined incident in the export.

The reports span 2026-04-01 through 2026-10-04 across 11 tenants. Intake tagged 356 as parser and 23 as hint. Intake uses browser locale, which can differ from tenant locale; its tags do not define the cause.

Five reports describe a one-day move: R-41202, R-41209, R-41236, R-41344, and R-41620. The component counts them under parser by tenant and channel. Preserve their descriptions and investigate the mismatch; the export does not prove that a date swap caused each one-day symptom.

Expected: parse each date with the tenant's date convention and preserve the intended date. Verify ambiguous dates with day-first tenants and preserve month-first behavior. Keep booking-v3 form-hint reports in their own ticket.

This ticket records a problem; no production fix or runtime reproduction is claimed.
