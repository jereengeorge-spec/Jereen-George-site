# TechButler Handbook

The operating system for the business. Written so someone who has never seen it can run
it from these pages.

**Founder console (published dashboard):**
https://claude.ai/code/artifact/a5892f2f-5984-4751-b162-f7aa3f436f66

The console is the operating surface — private by default, shareable from its own menu
on handoff. These markdown files are the source of truth behind it.

| Document | Answers |
|---|---|
| [`BUSINESS_MODEL.md`](BUSINESS_MODEL.md) | What the business is, who buys it, what it costs to run, how many customers replace an income, where it sits against competitors, what's still at risk |
| [`OPERATIONS.md`](OPERATIONS.md) | The daily / weekly / monthly rhythms, the seven tracked metrics, five standard procedures, five runbooks, the access inventory and handoff checklist |
| [`CRM.md`](CRM.md) | What the CRM actually is, every table and console panel, the acquisition-pipeline gap, and the migration that fills it |
| [`PARTNER_OUTREACH.md`](PARTNER_OUTREACH.md) | The referral channel made executable: free directories to build the list, the angle per profession, sendable scripts, objection handling, and the first-two-weeks plan |
| [`../marketing/GROWTH_MODEL.md`](../marketing/GROWTH_MODEL.md) | Which channel reaches income replacement, with the Hormozi money-model math and sources |
| [`../marketing/PLAYBOOK.md`](../marketing/PLAYBOOK.md) | How the content actually gets made |

## Rules for keeping this true

1. **Code wins over docs.** Where the shipped code and a document disagree, the code is
   right and the document is a bug. Fix the document that day.
2. **Change the markdown first, then republish the console.** A dashboard that has drifted
   from reality is worse than no dashboard.
3. **Never put a credential in here.** The access inventory names *which* accounts exist.
   Values live in a password manager, and nowhere else.

## Known drift

- `docs/PROJECT_PLAN.md` §5 in the app repo still proposes a $79/$149 two-tier price that
  was never shipped. The live model is one plan at $99/mo or $999/yr. That section should
  be struck.
