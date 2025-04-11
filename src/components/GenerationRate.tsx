import { useQuery } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";
import { useTRPC } from "~/trpc/react";

export const GenerationRate = () => {
  const trpc = useTRPC();
  const account = useActiveAccount();

  const { data: generationRate, isLoading } = useQuery(
    trpc.game.genRate.queryOptions({
      address: account?.address ?? "",
    }),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <div>Generation rate: {generationRate} / day</div>;
};
