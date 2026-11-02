# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.

## S01E03 investigation

The signed investigation is in `src/routes/kb/incidents/4471-reassessment/+page.svx`.
The rendered copy is in `rendered/incidents/4471-reassessment/index.html`.
Open the HTML file in a browser. The export includes its browser script and relative links.

Run `npm ci`, then `npm run build` to compile all supplied pages through mdsvex and Svelte.
The build uses the supplied component logic and tenant files. Its glob expansion reads the local files.
It does not fetch live support data.

The issue drafts are in `issues/`. They separate the parser defect from the booking-v3 hint defect.
Counts use unique report IDs and tenant locale, channel, and booking form.
The accepted decision record and original pages remain as historical evidence.
The new page proposes a replacement triage rule; it does not claim the desk accepted that proposal.

Validation: the generated page contains the computed cause counts, the one-day-move caveat,
the received/merged timeline, the dedupe cases, and the desk reference derived from its signature.
No production fix or browser interaction test is claimed.
