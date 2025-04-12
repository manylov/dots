import { useSnapshot } from "valtio";
import { playerClickHandler, store } from "~/lib/state";

export const Gamefield = () => {
  const { gamefield, availableCells } = useSnapshot(store);

  const getCellStyle = (index: number) => {
    const playerIndex = store.gamefield[index];
    if (playerIndex === null) {
      // If cell is empty, check if it's available
      if (availableCells.includes(index)) {
        return {
          backgroundColor: "#FFFDE7", // Light yellow
          cursor: "pointer",
        };
      }
      return {
        backgroundColor: "#E5E7EB", // Default gray
        cursor: "not-allowed",
      };
    }

    const cluster = store.clusters[playerIndex].find((cluster) =>
      cluster.cells.includes(index),
    );

    return {
      backgroundColor: cluster?.color || "transparent",
      cursor: "not-allowed",
    };
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid grid-cols-20 gap-2">
        {gamefield?.flat().map((cell, index) => (
          <div
            className="flex aspect-square h-8 items-center justify-center rounded-lg text-sm"
            key={`${index}-${cell}`}
            onClick={() => availableCells.includes(index) && playerClickHandler(index)}
            style={getCellStyle(index)}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
};
