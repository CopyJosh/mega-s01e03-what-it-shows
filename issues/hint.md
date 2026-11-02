The booking-v3 date field tells day-first tenants to enter a month-first date, then reads it day first.

Reports covered: **33 unique reports** from the 2026-10-04 export, after deduplication by report ID.

booking-v3 displays `MM/DD/YYYY`. Its form reads the date using the tenant's day-first convention. A person who follows the hint can therefore select the wrong date. This is a separate bug from the month-first shared parser.

The affected form reports belong to alder.physio (de-DE), copper.studio (es-ES), and pale.harbour (pt-PT). For example, R-41230 from copper.studio reports 1 June instead of 6 January. R-41241 from alder.physio reports 8 June instead of 6 August.

Evidence: `src/lib/kb/causes.ts` (`DATE_HINT`, `dayFirst`, `causeOf`, `uniqueById`, `groupByCause`), the tenant directory, and `src/lib/data/reports-4471.json`. The reports span 2026-04-17 through 2026-09-22. Intake tagged 15 as parser and 18 as hint; classify by tenant locale, channel, and form instead.

Expected: the form hint must match the date order that the form reads. Verify day-first booking-v3 forms and confirm that app/email reports remain separately classified.

Split these reports from the combined incident. A fix to the shared parser alone does not fix the form hint. No production fix or runtime reproduction is claimed.
