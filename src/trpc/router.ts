import { TRPCRouterRecord } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "./init";
import { z } from "zod";

const gameMock = Array(20)
  .fill(null)
  .map(() =>
    Array(20)
      .fill(null)
      .map(() =>
        Math.random() > 0.5
          ? `0x${Array(40)
              .fill(0)
              .map(() => Math.floor(Math.random() * 16).toString(16))
              .join("")}`
          : null,
      ),
  );

const gameRouter = {
  genRate: publicProcedure
    .input(
      z.object({
        address: z.string(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.address) return 0;
      return 100;
    }),
  gameField: publicProcedure.query(async () => {
    return gameMock;
  }),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
  game: gameRouter,
});

export type TRPCRouter = typeof trpcRouter;
