import { proxy } from "valtio";

interface Cluster {
  cells: number[];
  color: string;
}

const cellCost = 5; // 5 tokens per cell
const commissionPercent = 10; // 10% commission
const numPlayers = 10; // Number of players

const getAdjacentCells = (index: number) => {
  const row = Math.floor(index / 20);
  const col = index % 20;
  const adjacent: number[] = [];

  // Check left
  if (col > 0) adjacent.push(index - 1);
  // Check right
  if (col < 19) adjacent.push(index + 1);
  // Check top
  if (row > 0) adjacent.push(index - 20);
  // Check bottom
  if (row < 19) adjacent.push(index + 20);

  return adjacent;
};

const generateRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const calculateClusterWeight = (cellCount: number): number => {
  if (cellCount === 1) return 1;
  if (cellCount >= 2 && cellCount <= 4) return cellCount * 1.2;
  if (cellCount >= 5 && cellCount <= 9) return cellCount * 1.5;
  if (cellCount >= 10 && cellCount <= 19) return cellCount * 2.0;
  return cellCount * 3.0; // 20+ cells
};

const recalculatePlayerWeight = (playerIndex: number) => {
  const playerClusters = store.clusters[playerIndex];
  const totalWeight = playerClusters.reduce((sum, cluster) => {
    return sum + calculateClusterWeight(cluster.cells.length);
  }, 0);
  store.weights[playerIndex] = totalWeight;
};

// Calculate token distribution based on current weights
const calculateTokenDistribution = (amount: number): number[] => {
  const totalWeight = store.weights.reduce((sum, weight) => sum + weight, 0);

  if (totalWeight === 0) {
    // If no weights, all tokens go to treasury
    return Array(numPlayers).fill(0);
  } else {
    // Distribute based on weights
    return store.weights.map((weight) => (weight / totalWeight) * amount);
  }
};

export const playerClickHandler = (index: number) => {
  const selectedPlayerIndex = store.selectedPlayerIndex;

  // Check if cell is already taken
  if (store.gamefield[index] !== null) return;

  // Check if this is the first move (all users have 0 weights)
  const isFirstMove = store.weights.every((weight) => weight === 0);

  // Calculate commission
  const commission = (cellCost * commissionPercent) / 100;
  const distributableAmount = cellCost - commission;

  // Calculate token distribution before making any changes
  const distribution = calculateTokenDistribution(distributableAmount);

  // Increase the spent amount
  store.spent[selectedPlayerIndex] += cellCost;

  // Set the cell
  store.gamefield[index] = selectedPlayerIndex;

  // Find adjacent cells belonging to the same player
  const adjacentCells = getAdjacentCells(index);
  const adjacentPlayerCells = adjacentCells.filter(
    (cellIndex) => store.gamefield[cellIndex] === selectedPlayerIndex,
  );

  if (adjacentPlayerCells.length === 0) {
    // Create new cluster
    store.clusters[selectedPlayerIndex].push({
      cells: [index],
      color: generateRandomColor(),
    });
  } else {
    // Find all clusters that contain adjacent cells
    const connectedClusters = store.clusters[selectedPlayerIndex].filter((cluster) =>
      cluster.cells.some((cell) => adjacentPlayerCells.includes(cell)),
    );

    if (connectedClusters.length === 0) {
      // Should never happen, but just in case
      store.clusters[selectedPlayerIndex].push({
        cells: [index],
        color: generateRandomColor(),
      });
    } else if (connectedClusters.length === 1) {
      // Add to existing cluster
      connectedClusters[0].cells.push(index);
    } else {
      // Merge clusters
      const newCluster: Cluster = {
        cells: [
          ...new Set([index, ...connectedClusters.flatMap((cluster) => cluster.cells)]),
        ],
        color: connectedClusters[0].color,
      };

      // Remove old clusters
      store.clusters[selectedPlayerIndex] = store.clusters[selectedPlayerIndex].filter(
        (cluster) => !connectedClusters.includes(cluster),
      );

      // Add merged cluster
      store.clusters[selectedPlayerIndex].push(newCluster);
    }
  }

  // Recalculate weights after cluster changes
  recalculatePlayerWeight(selectedPlayerIndex);

  // Apply token distribution
  if (isFirstMove) {
    // On first move, all tokens go to treasury
    store.treasury += cellCost;
  } else {
    // Add commission to treasury
    store.treasury += commission;

    // Distribute the rest based on weights
    store.earned = store.earned.map((earned, index) => earned + distribution[index]);
  }

  // Update balances
  store.balances = store.balances.map(
    (_, index) => store.earned[index] - store.spent[index],
  );
};

export const store = proxy<{
  gamefield: (number | null)[];
  spent: number[];
  earned: number[];
  balances: number[];
  weights: number[];
  selectedPlayerIndex: number;
  clusters: Cluster[][];
  treasury: number;
}>({
  gamefield: Array.from({ length: 400 }, () => null),
  spent: Array(numPlayers).fill(0),
  earned: Array(numPlayers).fill(0),
  balances: Array(numPlayers).fill(0),
  weights: Array(numPlayers).fill(0),
  selectedPlayerIndex: 0,
  clusters: Array(numPlayers)
    .fill([])
    .map(() => []), // Clusters for all players
  treasury: 0,
});
