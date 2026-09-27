# Indexer verification record

Date: 2026-09-27. Ponder version: 0.17.12. Checks were run from a temporary copy under
`/tmp/imd-indexer-check`; no repository `node_modules` were retained.

## Static checks

- `npx ponder codegen` — passed; wrote `ponder-env.d.ts` and recognized all three configured
  events.
- `npx tsc --noEmit` — passed against Ponder 0.17.12.

## Local Anvil replay (blocked by the execution environment)

Started `anvil --chain-id 31337` (also retried on port 8555), then ran the requested
`forge create src/IMDOracleDisputeRegistry.sol:IMDOracleDisputeRegistry --rpc-url http://127.0.0.1:8555 ... --broadcast`.
Forge could not connect to the Anvil JSON-RPC listener (`tcp connect error: Connection timed out`).
Consequently deployment, calls, the Ponder replay, and local GraphQL results could not be observed
here. The event fixture intended for that run is: open dispute 1 and 2 for request
`0x00112233445566778899aabbccddeeff`; open dispute 3 for
`0xffeeddccbbaa99887766554433221100`; add responses 0 and 1 to dispute 2; withdraw dispute 1.
Expected aggregate fixture counts are request A `(openCount: 1, totalCount: 2)`, request B
`(openCount: 1, totalCount: 1)`, and dispute 2 `responseCount: 2`.

## Sepolia sync (attempted, incomplete)

Ran `PONDER_CHAIN_ID=11155111 PONDER_RPC_URL_11155111=https://ethereum-sepolia-rpc.publicnode.com ponder dev`
with the configured deployment address and start block 11781401. Ponder started the GraphQL API at
`http://localhost:42069`, entered backfill, and remained at 0.0% / “Waiting to start” until stopped.
A completed sync to the head was not verified. The known expectation for a completed sync, based on
the supplied deployment report that this registry had no events on 2026-09-27, is empty tables; this
is an expectation, not an observed query result from this run.

The three GraphQL queries and response selections to use after a successful replay are in
[`README.md`](./README.md). They are repeated here as GraphQL request bodies for the local fixture:

```graphql
query OpenDisputesForRequest {
  disputes(where: { requestId: "0x00112233445566778899aabbccddeeff", status: "open" }, orderBy: "id", orderDirection: "desc") {
    items { id requestUuid challenger rationale createdAt responseCount }
  }
}
```

```graphql
query ResponsesForDispute {
  responses(where: { disputeId: "2" }, orderBy: "index", orderDirection: "asc") {
    items { index author text evidenceURI createdAt }
  }
}
```

```graphql
query RequestsByOpenDisputeCount {
  requests(orderBy: "openCount", orderDirection: "desc") {
    items { requestId requestUuid openCount totalCount }
  }
}
```
