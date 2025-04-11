import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTRPC } from "~/trpc/react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const trpc = useTRPC();

  const { data: posts, isLoading: isLoadingPosts } = useQuery(
    trpc.post.list.queryOptions(),
  );

  return (
    <div className="p-10">
      <h3>Posts from backend with tRPC:</h3>

      {isLoadingPosts ? (
        <div>Loading...</div>
      ) : (
        <div>{posts?.map((post) => <div key={post.id}>{post.title}</div>)}</div>
      )}
    </div>
  );
}
