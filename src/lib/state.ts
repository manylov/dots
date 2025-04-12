import { proxy } from "valtio";

interface Cluster {
  cells: number[];
  color: string;
}

const cellCost = 5; // 5 tokens per cell
const swapCost = 1; // 1 token per swap
const commissionPercent = 10; // 10% commission
const numPlayers = 20; // Number of players

// Generate a consistent color for a player based on their index
const getPlayerColor = (playerIndex: number): string => {
  // Use a simple hash function to generate a hue value between 0 and 360
  const hue = (playerIndex * 137.508) % 360; // golden ratio * 360/2
  // Use high saturation and lightness for vibrant, visible colors
  return `hsl(${hue}, 70%, 65%)`;
};

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

// Calculate available cells for placement (empty cells with at least one neighbor)
const calculateAvailableCells = () => {
  const availableCells = new Set<number>();

  // If no cells are placed yet, all cells are available
  const hasAnyCells = store.gamefield.some((cell) => cell !== null);
  if (!hasAnyCells) {
    for (let i = 0; i < 400; i++) {
      availableCells.add(i);
    }
    return availableCells;
  }

  // Find all empty cells that have at least one occupied neighbor
  store.gamefield.forEach((cell, index) => {
    if (cell === null) {
      const adjacentCells = getAdjacentCells(index);
      if (adjacentCells.some((adjIndex) => store.gamefield[adjIndex] !== null)) {
        availableCells.add(index);
      }
    }
  });

  return availableCells;
};

const calculateClusterWeight = (cellCount: number): number => {
  if (cellCount === 1) return 1;
  if (cellCount >= 2 && cellCount <= 4) return cellCount * 1.2;
  if (cellCount >= 5 && cellCount <= 9) return cellCount * 1.5;
  if (cellCount >= 10 && cellCount <= 19) return cellCount * 2.0;
  return cellCount * 3.0; // 20+ cells
};

// Recalculate clusters for a player after cell changes
const recalculatePlayerClusters = (playerIndex: number) => {
  // Get all cells belonging to the player
  const playerCells = store.gamefield.reduce<number[]>((cells, cell, index) => {
    if (cell === playerIndex) cells.push(index);
    return cells;
  }, []);

  // Reset player's clusters
  store.clusters[playerIndex] = [];
  const visited = new Set<number>();
  const playerColor = getPlayerColor(playerIndex);

  // Find all clusters using DFS
  for (const cell of playerCells) {
    if (visited.has(cell)) continue;

    const cluster: number[] = [];
    const stack = [cell];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (visited.has(current)) continue;

      visited.add(current);
      cluster.push(current);

      // Check adjacent cells
      const adjacent = getAdjacentCells(current);
      for (const adj of adjacent) {
        if (!visited.has(adj) && store.gamefield[adj] === playerIndex) {
          stack.push(adj);
        }
      }
    }

    // Add new cluster
    store.clusters[playerIndex].push({
      cells: cluster,
      color: playerColor,
    });
  }
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

// Update available cells whenever the game field changes
const updateAvailableCells = () => {
  store.availableCells = Array.from(calculateAvailableCells());
};

// Handle cell swapping between players
export const swapCells = (targetIndex: number) => {
  // If no cell is selected or trying to swap with the same cell, do nothing
  if (store.selectedCell === null || store.selectedCell === targetIndex) return;

  const selectedPlayerIndex = store.selectedPlayerIndex;
  const targetPlayerIndex = store.gamefield[targetIndex];

  // Cannot swap with empty cell
  if (targetPlayerIndex === null) return;

  // Calculate commission
  const commission = (swapCost * commissionPercent) / 100;
  const distributableAmount = swapCost - commission;

  // Calculate token distribution before making any changes
  const distribution = calculateTokenDistribution(distributableAmount);

  // Increase the spent amount for the initiating player
  store.spent[selectedPlayerIndex] += swapCost;

  // Add commission to treasury first
  store.treasury += commission;

  // Distribute the remaining amount based on weights
  store.earned = store.earned.map((earned, index) => earned + distribution[index]);

  // Swap the cells
  const selectedCell = store.selectedCell;
  store.gamefield[selectedCell] = targetPlayerIndex;
  store.gamefield[targetIndex] = selectedPlayerIndex;

  // Get unique player indices involved in the swap
  const affectedPlayers = new Set([selectedPlayerIndex, targetPlayerIndex]);

  // Recalculate clusters and weights for affected players
  affectedPlayers.forEach((playerIndex) => {
    recalculatePlayerClusters(playerIndex);
    recalculatePlayerWeight(playerIndex);
  });

  // Update balances
  store.balances = store.balances.map(
    (_, index) => store.earned[index] - store.spent[index],
  );

  // Clear selected cell
  store.selectedCell = null;
};

export const selectCell = (index: number) => {
  const playerIndex = store.gamefield[index];

  // Can only select own cells
  if (playerIndex !== store.selectedPlayerIndex) return;

  // If clicking the same cell, deselect it
  if (store.selectedCell === index) {
    store.selectedCell = null;
    return;
  }

  // If clicking another owned cell, select it
  store.selectedCell = index;
};

export const playerClickHandler = (index: number) => {
  const selectedPlayerIndex = store.selectedPlayerIndex;

  // If a cell is selected and clicking on another player's cell, handle swap
  if (store.selectedCell !== null && store.gamefield[index] !== null) {
    swapCells(index);
    return;
  }

  // Check if cell is already taken
  if (store.gamefield[index] !== null) {
    // If clicking own cell, handle selection
    if (store.gamefield[index] === selectedPlayerIndex) {
      selectCell(index);
    }
    return;
  }

  // Check if the cell is available for placement
  if (!store.availableCells.includes(index)) return;

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

  const playerColor = getPlayerColor(selectedPlayerIndex);

  if (adjacentPlayerCells.length === 0) {
    // Create new cluster
    store.clusters[selectedPlayerIndex].push({
      cells: [index],
      color: playerColor,
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
        color: playerColor,
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
        color: playerColor,
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

  // Update available cells
  updateAvailableCells();
};

export const selectPlayer = (index: number) => {
  store.selectedPlayerIndex = index;
  store.selectedCell = null; // Reset selected cell when switching players
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
  availableCells: number[];
  selectedCell: number | null;
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
  availableCells: Array.from({ length: 400 }, (_, i) => i), // Initially all cells are available
  selectedCell: null, // Currently selected cell for swapping
});
