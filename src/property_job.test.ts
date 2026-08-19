import { strict as assert } from "node:assert";
import { inspectionReminder } from "./property_job.ts";

const due = {
  propertyId: "building-17",
  maintenanceRequestId: "repair-204",
  tenantDocumentId: "lease-88",
  inspectionDueOn: "2026-08-11",
  today: "2026-08-11",
};

assert.equal(inspectionReminder(due), true);
assert.equal(inspectionReminder({ ...due, inspectionDueOn: "2026-08-12" }), false);
console.log("inspection reminder decision passed");
