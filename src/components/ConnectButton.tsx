import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";
import { client } from "~/lib/thirdweb";

export function ConnectButton() {
  return (
    <div>
      <ThirdwebConnectButton client={client} />
    </div>
  );
}
