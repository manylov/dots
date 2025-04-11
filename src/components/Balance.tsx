import { getContract } from "thirdweb";
import { getBalance } from "thirdweb/extensions/erc20";
import { client, zero } from "~/lib/thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";

const contract = getContract({
  client,
  address: "0x1A90DD3Dd89E2D2095ED1B40eCC1fe2BbB7614a1",
  chain: zero,
});

export const Balance = () => {
  const account = useActiveAccount();

  const balance = useReadContract(getBalance, {
    contract,
    address: account?.address ?? "",
  });

  return <div>Balance: {balance.data?.displayValue}</div>;
};
