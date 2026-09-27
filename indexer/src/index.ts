import { ponder } from "ponder:registry";
import { dispute, request, response } from "ponder:schema";

function uuid(hex: string): string {
  const s = hex.slice(2).toLowerCase();
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

ponder.on("IMDOracleDisputeRegistry:DisputeOpened", async ({ event, context }) => {
  const requestId = event.args.requestId.toLowerCase() as `0x${string}`;
  const requestUuid = uuid(requestId);
  await context.db.insert(dispute).values({
    id: event.args.disputeId, challenger: event.args.challenger,
    requestId, requestUuid, sourceChainId: event.args.sourceChainId,
    attestationSnapshotHash: event.args.attestationSnapshotHash, evidenceHash: event.args.evidenceHash,
    evidenceURI: event.args.evidenceURI, rationale: event.args.rationale,
    createdAt: event.args.createdAt, status: "open", withdrawnAt: null,
    responseCount: 0n, transactionHash: event.transaction.hash, blockNumber: event.block.number,
  });
  const existing = await context.db.find(request, { requestId });
  if (existing) {
    await context.db.update(request, { requestId }).set({ openCount: existing.openCount + 1n, totalCount: existing.totalCount + 1n });
  } else {
    await context.db.insert(request).values({ requestId, requestUuid, openCount: 1n, totalCount: 1n });
  }
});

ponder.on("IMDOracleDisputeRegistry:ResponseAdded", async ({ event, context }) => {
  await context.db.insert(response).values({
    disputeId: event.args.disputeId, index: event.args.responseIndex, author: event.args.author,
    evidenceHash: event.args.evidenceHash, evidenceURI: event.args.evidenceURI, text: event.args.text,
    createdAt: event.args.createdAt, transactionHash: event.transaction.hash, blockNumber: event.block.number,
  });
  const current = await context.db.find(dispute, { id: event.args.disputeId });
  if (current) await context.db.update(dispute, { id: event.args.disputeId }).set({ responseCount: current.responseCount + 1n });
});

ponder.on("IMDOracleDisputeRegistry:DisputeWithdrawn", async ({ event, context }) => {
  const current = await context.db.find(dispute, { id: event.args.disputeId });
  if (!current) throw new Error(`Missing dispute ${event.args.disputeId}`);
  await context.db.update(dispute, { id: event.args.disputeId }).set({ status: "withdrawn", withdrawnAt: event.args.withdrawnAt });
  const currentRequest = await context.db.find(request, { requestId: current.requestId });
  if (currentRequest) await context.db.update(request, { requestId: current.requestId }).set({ openCount: currentRequest.openCount - 1n });
});
