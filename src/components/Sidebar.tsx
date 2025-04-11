import { Balance } from "./Balance";
import { ConnectButton } from "./ConnectButton";
import { GenerationRate } from "./GenerationRate";

export const Sidebar = () => {
  return (
    <div>
      <ConnectButton />
      <Balance />
      <GenerationRate />
    </div>
  );
};
