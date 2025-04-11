import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";

export const Gamefield = () => {
  const trpc = useTRPC();

  const { data: gameField, isLoading } = useQuery(trpc.game.gameField.queryOptions());

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid h-full grid-cols-20 gap-[1px]">
      {gameField
        ?.flat()
        .map((cell, index) => (
          <div
            className="aspect-square h-full w-fit rounded-xl bg-gray-200"
            key={`${index}-${cell}`}
          />
        ))}
    </div>
  );
};
