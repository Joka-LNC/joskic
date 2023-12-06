import { config } from "@onflow/fcl";

config()
    .put("app.detail.title", "Ivan Joskić završni rad") // this adds a custom name to our wallet
    .put("app.detail.icon", "https://i.postimg.cc/hjbqd0gK/favicon-32x32.png") // this adds a custom image to our wallet
    .put("accessNode.api", "https://rest-testnet.onflow.org") // This connects us to Flow TestNet
    .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn/") // Allows us to connect to Blocto & Lilico Wallet
    .put("discovery.authn.endpoint", "https://fcl-discovery.onflow.org/api/testnet/authn",)
    .put("flow.network", "testnet")
    .put("0xDeployer", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) // this auto configures `0xDeployer` to be replaced by the address in txs and scripts
    .put("0xStandard", process.env.NEXT_PUBLIC_STANDARD_ADDRESS)