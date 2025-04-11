import { createFileRoute } from "@tanstack/react-router";
import { Gamefield } from "~/components/Gamefield";
import { Sidebar } from "~/components/Sidebar";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex h-screen w-full gap-10 p-10">
      <div className="w-4/5">
        <Gamefield />
      </div>
      <div className="w-1/5">
        <Sidebar />
      </div>
    </div>
  );
}
