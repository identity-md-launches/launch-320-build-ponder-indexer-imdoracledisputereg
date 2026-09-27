# IMD Oracle Dispute Registry indexer

Ponder indexes every state-changing registry event: `DisputeOpened`, `ResponseAdded`, and
`DisputeWithdrawn`. It stores the event strings verbatim as text. They are untrusted user input;
clients must escape them for their output context and must never insert them as HTML.

## Configuration

Install with `npm install`, then run `npm run dev`. By default this follows Sepolia from deployment
block `11781401`, at `0xbcd93c85adb43628b6b0e4257c864158351b4ecb`. Set
`PONDER_RPC_URL_11155111` to override the RPC; the public default is
`https://ethereum-sepolia-rpc.publicnode.com`. `PONDER_CONTRACT_ADDRESS` and `PONDER_START_BLOCK`
override the address and start block. The config also declares local Anvil chain 31337 with
`PONDER_RPC_URL_31337` defaulting to `http://127.0.0.1:8545`; set `PONDER_CHAIN_ID=31337` to index
that chain, and optionally set `PONDER_CONTRACT_ADDRESS` and `PONDER_START_BLOCK` for its deployment.

## GraphQL examples

Ponder serves GraphQL at `http://localhost:42069`. These use the generated GraphQL API and sort
newest disputes first, responses in ascending event index, and requests by their current open count.

Open disputes for a request UUID (filter uses its canonical lowercase 0x hex):

```graphql
query OpenDisputesForRequest {
  disputes(where: { requestId: "0x00112233445566778899aabbccddeeff", status: "open" }, orderBy: "id", orderDirection: "desc") {
    items { id requestUuid challenger rationale createdAt responseCount }
  }
}
```

Responses, in append order:

```graphql
query ResponsesForDispute {
  responses(where: { disputeId: "1" }, orderBy: "index", orderDirection: "asc") {
    items { index author text evidenceURI createdAt }
  }
}
```

Requests with the most currently open disputes:

```graphql
query RequestsByOpenDisputeCount {
  requests(orderBy: "openCount", orderDirection: "desc") {
    items { requestId requestUuid openCount totalCount }
  }
}
```

No event is omitted. `request.openCount` and `totalCount` are maintained from open and withdrawal
events; a withdrawal closes a dispute, while responses leave its status unchanged. There is no
on-chain edit or deletion event to index.
