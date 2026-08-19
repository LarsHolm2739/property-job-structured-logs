import { searchPropertyLogs, shipPropertyEvent } from "./infrai_logs.ts";

export type PropertyJob = {
  propertyId: string;
  maintenanceRequestId: string;
  tenantDocumentId: string;
  inspectionDueOn: string;
  today: string;
};

export function inspectionReminder(job: PropertyJob): boolean {
  return job.inspectionDueOn <= job.today;
}

export async function runPropertyJob(job: PropertyJob): Promise<{ reminder: boolean; results: unknown }> {
  const reminder = inspectionReminder(job);
  await shipPropertyEvent({
    event: "property_job.completed",
    property_id: job.propertyId,
    maintenance_request_id: job.maintenanceRequestId,
    tenant_document_id: job.tenantDocumentId,
    inspection_due_on: job.inspectionDueOn,
    reminder,
  });
  const results = await searchPropertyLogs({ q: job.propertyId, filter: "event:property_job.completed" });
  return { reminder, results };
}

if (import.meta.main) {
  const job: PropertyJob = {
    propertyId: "building-17",
    maintenanceRequestId: "repair-204",
    tenantDocumentId: "lease-88",
    inspectionDueOn: "2026-08-11",
    today: "2026-08-11",
  };
  const result = await runPropertyJob(job);
  console.log(JSON.stringify({ propertyId: job.propertyId, reminder: result.reminder }, null, 2));
}
