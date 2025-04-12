import { useSnapshot } from "valtio";
import { store } from "~/lib/state";

export const Treasury = () => {
  const { treasury } = useSnapshot(store);

  return (
    <div className="flex flex-col gap-1">
      <div>Treasury: {treasury.toFixed(0)}</div>
      <div className="text-sm text-gray-500">Commission: 10%</div>
    </div>
  );
};
