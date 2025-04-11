import { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./init";

const mockPosts = [
  {
    id: "1",
    title: "Hello Tanstack",
    body: "world",
  },
  {
    id: "2",
    title: "Hello Trpc",
    body: "world",
  },
] satisfies Post[];

type Post = {
  id: string;
  title: string;
  body: string;
};

const postRouter = {
  list: publicProcedure.query(async () => {
    return mockPosts;
  }),
  byId: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return mockPosts.find((post) => post.id === input.id);
  }),
} satisfies TRPCRouterRecord;

const userRouter = {
  me: publicProcedure.query(() => ({ name: "John Doe" })),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
});

export type TRPCRouter = typeof trpcRouter;
