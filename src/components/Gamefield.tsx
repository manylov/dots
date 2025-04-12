import { useQuery } from "@tanstack/react-query";
import { useSnapshot } from "valtio";
import { playerClickHandler, store } from "~/lib/state";
import { useTRPC } from "~/trpc/react";

export const Gamefield = () => {
  // const trpc = useTRPC();

  // const { data: gameField, isLoading } = useQuery(trpc.game.gameField.queryOptions());

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  const { gamefield } = useSnapshot(store);

  const getCellStyle = (index: number) => {
    const playerIndex = store.gamefield[index];
    if (playerIndex === null) return {};

    const cluster = store.clusters[playerIndex].find((cluster) =>
      cluster.cells.includes(index),
    );

    return {
      border: `1px solid ${cluster?.color || "transparent"}`,
    };
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="grid grid-cols-20 gap-2">
        {gamefield?.flat().map((cell, index) => (
          <div
            className="flex aspect-square h-8 items-center justify-center rounded-lg bg-gray-200 text-sm hover:bg-gray-300"
            key={`${index}-${cell}`}
            onClick={() => playerClickHandler(index)}
            style={getCellStyle(index)}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
};
