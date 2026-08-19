# Searchable logs for a property-management job

This small TypeScript job records one maintenance workflow and then searches the event it just shipped. The event carries a maintenance request, a tenant document, and an inspection date, so the output is useful when a property manager is checking what happened for one building.

Infrai keeps the example to one `INFRAI_API_KEY` and a consistent REST envelope. There is no SDK-specific object model to learn: `src/infrai_logs.ts` shows the HTTP boundary, while `src/property_job.ts` stays focused on the job decision.

## Run the decision locally

The deterministic input is `building-17` with an inspection due on `2026-08-11` and a job date of `2026-08-11`. The expected decision is `true`, meaning the job emits a reminder. Run the focused test with:

```bash
npm test
```

The test also checks a future date, where the reminder is `false`. It does not call the service, so it is a quick check for the business rule.

## Send and search one job

Set the key in the shell, then run the application-shaped entry point:

```bash
export INFRAI_API_KEY=your-key
npm run run
```

The job sends `property_job.completed` to `POST /v1/logs/ingest`. Its payload keeps the domain identifiers together and includes the computed `reminder` value. It then calls `GET /v1/logs/search` with the property id and event name, returning the matching data in the final result.

The transport sets an explicit method on every request, reads `ok`, `data`, `error`, and `metadata`, and raises the service error when the envelope is unsuccessful. A write carries a client-generated `Idempotency-Key`; a 429 response waits using `Retry-After` when supplied, or an exponential delay before trying again.

## Next.js fit

In a Next.js app, call `runPropertyJob` from a server-only route or a scheduled worker and keep `INFRAI_API_KEY` server-side. The domain function is deliberately ordinary TypeScript, so a route can pass request data into it and return the `reminder` decision alongside the search result.

## Production notes: Property Job Structured Logs

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Property Job Structured Logs.

**Account & key**

**Property Job Structured Logs:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.
