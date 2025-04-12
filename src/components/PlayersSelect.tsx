import { useSnapshot } from "valtio";
import { store } from "~/lib/state";

export const PlayersSelect = () => {
  const { spent, earned, balances, weights, selectedPlayerIndex } = useSnapshot(store);

  return (
    <div className="flex flex-col gap-2">
      {balances.map((_, index) => (
        <div key={index}>
          <button
            data-selected={selectedPlayerIndex === index}
            className="rounded-full bg-gray-200 p-2 data-[selected=true]:bg-gray-400"
            onClick={() => (store.selectedPlayerIndex = index)}
          >
            <div className="flex flex-col items-start">
              <div>Player {index}</div>
              <div className="text-sm">
                <span>Spent: {spent[index].toFixed(0)}</span> |
                <span> Earned: {earned[index].toFixed(0)}</span> |
                <span> Balance: {balances[index].toFixed(0)}</span> |
                <span> Weight: {weights[index].toFixed(1)}</span>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};
