export function startDfs(grid, closestNode, finishNode, visitedNodesInOrder) {
  console.log(closestNode);
  closestNode.isVisited = true;
  if (closestNode !== undefined) {
    visitedNodesInOrder.push(closestNode);
  }

  var unvisitedNeighbors = getUnvisitedNeighbors(closestNode, grid);

  for (var x = 0; x < unvisitedNeighbors.length; x++) {
    if (!unvisitedNeighbors[x].isVisited) {
      if (unvisitedNeighbors[x].isWall) {
        continue;
      }
      if (unvisitedNeighbors[x] === finishNode) {
        return visitedNodesInOrder;
      }
      startDfs(grid, unvisitedNeighbors[x], finishNode, visitedNodesInOrder);
    }
  }
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const {col, row} = node;
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors.filter(neighbor => !neighbor.isVisited);
}
