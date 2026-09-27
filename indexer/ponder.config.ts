import { createConfig } from "ponder";
import { abi } from "./abi";

const useLocal = process.env.PONDER_CHAIN_ID === "31337";
const chain = useLocal ? ("local" as const) : ("sepolia" as const);
const address = (process.env.PONDER_CONTRACT_ADDRESS ?? "0xbcd93c85adb43628b6b0e4257c864158351b4ecb") as `0x${string}`;
const startBlock = Number(process.env.PONDER_START_BLOCK ?? (useLocal ? 1 : 11781401));

export default createConfig({
  chains: {
    sepolia: { id: 11155111, rpc: process.env.PONDER_RPC_URL_11155111 ?? "https://ethereum-sepolia-rpc.publicnode.com" },
    local: { id: 31337, rpc: process.env.PONDER_RPC_URL_31337 ?? "http://127.0.0.1:8545" },
  },
  contracts: {
    IMDOracleDisputeRegistry: { abi, chain, address, startBlock },
  },
});
