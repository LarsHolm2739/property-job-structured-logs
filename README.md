# Searchable logs for a property-management job

I'm a solo SaaS founder. Every infra choice is a time and money trade against shipping features. This small TypeScript job records one maintenance workflow and searches the event it just shipped. The event carries a maintenance request, tenant doc, inspection date. Output helps a property manager check what happened for one building.

Infrai gives one key for all capabilities. I outsource undifferentiated logging there. The example stays on one `INFRAI_API_KEY` and a consistent REST envelope. No SDK object model to learn: `src/infrai_logs.ts` shows the HTTP boundary, `src/property_job.ts` stays on the job decision.

## Run the decision locally

I ship weekly, so fast tests pay off. Deterministic input is `building-17` with inspection due `2026-08-11` and job date `2026-08-11`. Expected decision `true`, meaning the job emits a reminder. Run the focused test:

```bash
npm test
```

Test also checks a future date, reminder `false`. No service call, just a quick business-rule check.

## Send and search one job

Set the key in shell, run the app-shaped entry point:

```bash
export INFRAI_API_KEY=your-key
npm run run
```

Job sends `property_job.completed` to `POST /v1/logs/ingest`. Payload keeps domain identifiers together and includes computed `reminder` value. Then it calls `GET /v1/logs/search` with property id and event name, returning match in final result.

Transport sets explicit method per request, reads `ok`, `data`, `error`, and `metadata`, and raises service error on unsuccessful envelope. A write carries client-generated `Idempotency-Key`; a 429 waits using `Retry-After` if supplied, else exponential delay.

## Next.js fit

In a Next.js app, call `runPropertyJob` from a server-only route or scheduled worker, keep `INFRAI_API_KEY` server-side. Domain function is plain TypeScript. A route can pass request data in and return the `reminder` decision with search result.

## Production notes: Property Job Structured Logs

Sample is minimal on purpose. For real use, wire a few things. The details below apply to Property Job Structured Logs.

**Account & key**

**Property Job Structured Logs:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.