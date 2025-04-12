import { Treasury } from "./Balance";
import { ConnectButton } from "./ConnectButton";
import { GenerationRate } from "./GenerationRate";
import { PlayersSelect } from "./PlayersSelect";

export const Sidebar = () => {
  return (
    <div>
      <ConnectButton />
      <Treasury />
      <GenerationRate />
      <PlayersSelect />
    </div>
  );
};
