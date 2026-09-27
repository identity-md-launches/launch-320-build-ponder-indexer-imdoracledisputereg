import { onchainTable, primaryKey } from "ponder";

export const dispute = onchainTable("dispute", (t) => ({
  id: t.bigint().primaryKey(),
  challenger: t.hex().notNull(),
  requestId: t.hex().notNull(),
  requestUuid: t.text().notNull(),
  sourceChainId: t.bigint().notNull(),
  attestationSnapshotHash: t.hex().notNull(),
  evidenceHash: t.hex().notNull(),
  evidenceURI: t.text().notNull(),
  rationale: t.text().notNull(),
  createdAt: t.bigint().notNull(),
  status: t.text().notNull(),
  withdrawnAt: t.bigint(),
  responseCount: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
}));

export const response = onchainTable("response", (t) => ({
  disputeId: t.bigint().notNull(),
  index: t.bigint().notNull(),
  author: t.hex().notNull(),
  evidenceHash: t.hex().notNull(),
  evidenceURI: t.text().notNull(),
  text: t.text().notNull(),
  createdAt: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  blockNumber: t.bigint().notNull(),
}), (table) => ({ pk: primaryKey({ columns: [table.disputeId, table.index] }) }));

export const request = onchainTable("request", (t) => ({
  requestId: t.hex().primaryKey(),
  requestUuid: t.text().notNull(),
  openCount: t.bigint().notNull(),
  totalCount: t.bigint().notNull(),
}));
