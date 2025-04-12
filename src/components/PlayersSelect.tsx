import { useSnapshot } from "valtio";
import { store } from "~/lib/state";

export const PlayersSelect = () => {
  const { spent, earned, balances, weights, selectedPlayerIndex } = useSnapshot(store);

  return (
    <div className="flex h-full flex-col gap-1">
      {balances.map((_, index) => (
        <div key={index} className="flex-1">
          <button
            data-selected={selectedPlayerIndex === index}
            className="h-full w-full rounded-lg bg-gray-200 px-2 py-1 text-sm data-[selected=true]:bg-gray-400"
            onClick={() => (store.selectedPlayerIndex = index)}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium">P{index}</div>
              <div className="text-xs">
                <span>S:{spent[index].toFixed(0)}</span>
                <span className="mx-1">E:{earned[index].toFixed(0)}</span>
                <span className="mx-1">B:{balances[index].toFixed(0)}</span>
                <span>W:{weights[index].toFixed(1)}</span>
              </div>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};
