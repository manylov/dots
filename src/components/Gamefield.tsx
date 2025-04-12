import { useSnapshot } from "valtio";
import { playerClickHandler, store } from "~/lib/state";

export const Gamefield = () => {
  const { gamefield, availableCells, selectedCell, selectedPlayerIndex } =
    useSnapshot(store);

  const getCellStyle = (index: number) => {
    const playerIndex = store.gamefield[index];

    // Base style for selected cell
    const isSelected = selectedCell === index;
    const selectedStyle = isSelected
      ? {
          border: "2px solid white",
          boxShadow: "0 0 0 2px black",
        }
      : {};

    if (playerIndex === null) {
      // If cell is empty, check if it's available
      if (availableCells.includes(index)) {
        return {
          backgroundColor: "#FFFDE7", // Light yellow
          cursor: "pointer",
          ...selectedStyle,
        };
      }
      return {
        backgroundColor: "#E5E7EB", // Default gray
        cursor: "not-allowed",
        ...selectedStyle,
      };
    }

    const cluster = store.clusters[playerIndex].find((cluster) =>
      cluster.cells.includes(index),
    );

    // Determine cursor and interaction styles
    const isOwnCell = playerIndex === selectedPlayerIndex;
    const canInteract = isOwnCell || (selectedCell !== null && playerIndex !== null);

    return {
      backgroundColor: cluster?.color || "transparent",
      cursor: canInteract ? "pointer" : "not-allowed",
      ...selectedStyle,
    };
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid grid-cols-20 gap-2">
        {gamefield?.flat().map((cell, index) => {
          const playerIndex = gamefield[index];
          const isOwnCell = playerIndex === selectedPlayerIndex;
          const canInteract =
            isOwnCell || (selectedCell !== null && playerIndex !== null);
          const showHoverEffect =
            (isOwnCell && !selectedCell) || // Own cells when nothing is selected
            (selectedCell !== null && playerIndex !== null && selectedCell !== index); // Any occupied cell except the selected one

          return (
            <div
              className={`flex aspect-square h-8 items-center justify-center rounded-lg text-sm transition-all duration-150 ${canInteract ? "hover:scale-105" : ""} ${showHoverEffect ? "hover:ring-opacity-50 hover:ring-2 hover:ring-white" : ""} `}
              key={`${index}-${cell}`}
              onClick={() => playerClickHandler(index)}
              style={getCellStyle(index)}
            >
              {cell}
            </div>
          );
        })}
      </div>
    </div>
  );
};
