import { createThirdwebClient, defineChain } from "thirdweb";

export const client = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID,
});

export const zero = /*@__PURE__*/ defineChain({
  id: 543210,
  name: "Zero Chain",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Zero Explorer",
      url: "https://zero-network.calderaexplorer.xyz",
    },
  ],
  rpcUrls: {
    default: {
      http: ["https://zero-network.calderachain.xyz/http"],
    },
  },
});
