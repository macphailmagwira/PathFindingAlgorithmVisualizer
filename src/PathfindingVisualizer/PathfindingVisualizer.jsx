import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';

import './PathfindingVisualizer.css';
var START_NODE_ROW = 13;
var START_NODE_COL = 20;
var FINISH_NODE_ROW = 13;
var FINISH_NODE_COL = 60;
var boardToClear;
var elasped;
var selectingNodes = false;
var startNodeChange = false;
var finishNodeChange = false;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    const {grid} = this.state;

    if (selectingNodes === true) {
      if (startNodeChange === false) {
        document.getElementById(
          `node-${START_NODE_ROW}-${START_NODE_COL}`,
        ).className = 'node ';
        grid[START_NODE_ROW][START_NODE_COL].isStart = false;

        document.getElementById(`node-${row}-${col}`).className =
          'node node-start';
        START_NODE_COL = col;
        START_NODE_ROW = row;
        grid[START_NODE_ROW][START_NODE_COL].isStart = true;

        startNodeChange = true;
      } else if (finishNodeChange === false) {
        document.getElementById(
          `node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`,
        ).className = 'node ';

        grid[FINISH_NODE_ROW][FINISH_NODE_COL].isFinish = false;

        document.getElementById(`node-${row}-${col}`).className =
          'node node-finish';
        FINISH_NODE_COL = col;
        FINISH_NODE_ROW = row;
        grid[FINISH_NODE_ROW][FINISH_NODE_COL].isFinish = true;
        finishNodeChange = true;
      }

      if (startNodeChange && finishNodeChange) {
        selectingNodes = false;
      }
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid, mouseIsPressed: true});
      document.getElementById(`node-${row}-${col}`).className =
        'node node-wall';
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
    document.getElementById(`node-${row}-${col}`).className = 'node node-wall';
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  selectNodes() {
    selectingNodes = true;
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    this.animateStartFinish();

    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 15 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';
        }
      }, 15 * i);
    }
  }

  animateStartFinish() {
    document.getElementById(
      `node-${START_NODE_ROW}-${START_NODE_COL}`,
    ).className = 'node start-animate';

    document.getElementById(
      `node-${FINISH_NODE_ROW}-${FINISH_NODE_COL}`,
    ).className = 'node finish-animate';
  }

  resetBoard(visitedNodesInOrder, nodesInShortestPathOrder) {
    window.location.reload();

    /*for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      const node = visitedNodesInOrder[i];

      if (!node.isStart && !node.isFinish) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node ';
      } else if (node.isStart) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-start ';
      } else if (node.isFinish) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-finish ';
      }
    }

    boardToClear = [];*/
  }

  animateShortestPath(nodesInShortestPathOrder) {
    var count = 0;
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      count++;
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];

        if (node.isStart) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-start';
        } else if (node.isFinish) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-finish';
        } else {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-shortest-path';
        }
      }, 15 * i);
    }

    document.getElementById('totalDistance').innerHTML =
      'Total Distance: ' + count + 'KM';

    document.getElementById('totalTime').innerHTML =
      'Total Time: ' + elasped + 'ms';
  }

  randomMaze() {
    const {grid} = this.state;
    const newGrid = grid.slice();
    var path = [];
    var random = Math.floor(Math.random() * 20);
    var random2 = Math.floor(Math.random() * 50);

    for (var i = 0; i < newGrid.length; i++) {
      for (var j = 0; j < newGrid[i].length; j++) {
        if (j % 2 !== 0) {
          if (i === random || i === random2) {
            continue;
          }
          const node = newGrid[i][j];

          const newNode = {
            ...node,
            isWall: true,
          };
          newGrid[i][j] = newNode;
          path.push(newNode);
        }
        random = Math.floor(Math.random() * 27);
        random2 = Math.floor(Math.random() * 80);
      }
    }
    this.animateWall(path);
    this.setState({grid: newGrid});
  }

  getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const {col, row} = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors;
  }

  startDfs(nodeinput, stack, newGrid) {
    var unvisitedNeighbors = this.getUnvisitedNeighbors(nodeinput, newGrid);

    //var random = Math.floor(Math.random() * (unvisitedNeighbors.length - 1));
    // var nodeToSkip = unvisitedNeighbors[random];

    for (var i = 0; i < unvisitedNeighbors.length; i++) {
      //if (unvisitedNeighbors[i] !== nodeToSkip) {
      unvisitedNeighbors[i].isVisited = true;
      stack.push(unvisitedNeighbors[i]);
      // }

      while (unvisitedNeighbors[i].isVisited !== true) {
        this.startDfs(unvisitedNeighbors[i], stack, newGrid);
      }
    }
  }

  drawDown(node, newGrid, path) {
    var random = Math.floor(Math.random() * 26);

    var count = 0;
    for (var i = 0; i < 26; i++) {
      for (var j = 0; j < 26; j++) {
        if (j === count) {
          if (j === random) {
          } else {
            node = newGrid[i][j];
            node.isWall = true;
            path.push(node);
          }
        }
      }
      count++;
    }
  }

  drawDown2(node, newGrid, path) {
    var random = Math.floor(Math.random() * (74 - 50) + 50);
    var count = 50;
    for (var i = 0; i < 26; i++) {
      for (var j = 50; j < 76; j++) {
        if (j === count) {
          if (j === random) {
          } else {
            node = newGrid[i][j];
            node.isWall = true;
            path.push(node);
          }
        }
      }
      count++;
    }
  }

  drawUp(node, newGrid, path) {
    var random = Math.floor(Math.random() * (50 - 25) + 25);
    var count = 25;
    for (var k = 25; k >= 0; k--) {
      for (var l = 25; l < 52; l++) {
        if (l === count) {
          if (l === random) {
          } else {
            node = newGrid[k][l];
            node.isWall = true;
            path.push(node);
          }
        }
      }
      count++;
    }
  }

  stairPattern() {
    const {grid} = this.state;
    const newGrid = grid.slice();
    var path = [];

    var node;
    //var column = 0;
    this.drawDown(node, newGrid, path);
    this.drawUp(node, newGrid, path);
    this.drawDown2(node, newGrid, path);

    this.animateWall(path);
  }

  animateWall(path) {
    for (let i = 0; i <= path.length; i++) {
      if (path[i] !== undefined) {
        setTimeout(() => {
          document.getElementById(
            `node-${path[i].row}-${path[i].col}`,
          ).className = 'node node-wall';
        }, 15 * i);
      }
    }
  }

  visualizeDijkstra() {
    var nodesInShortestPathOrder = [];
    var visitedNodesInOrder = [];
    const {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    var start = new Date().getTime();
    visitedNodesInOrder = dijkstra(grid, startNode, finishNode);

    boardToClear = visitedNodesInOrder;
    nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    var stop = new Date().getTime();
    elasped = stop - start;

    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <>
        <div className="top_panel">
          <div className="top_nav">
            <h3>PathFinding Visualizer</h3>

            <nav role="navigation" className="primary-navigation">
              <ul>
                <li>
                  <button>Algorithms</button>
                  <ul className="dropdown">
                    <li>
                      <button>Dijkstra</button>
                    </li>
                    <li>
                      <button>Depth First</button>
                    </li>
                    <li>
                      <button>Breadth First</button>
                    </li>
                    <li>
                      <button>Swarm</button>
                    </li>
                  </ul>
                </li>
                <li>
                  <button>Maizes and Patterns</button>
                  <ul className="dropdown">
                    <li>
                      <button onClick={() => this.stairPattern()}>
                        Stair Pattern
                      </button>
                    </li>
                    <li>
                      <button>Recursive division</button>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>

            <div id="middle">
              <button
                type="button"
                className="letsBegin"
                onClick={() => this.visualizeDijkstra()}>
                Visualize
              </button>
              <button
                className="reset"
                onClick={() => this.resetBoard(boardToClear)}>
                Reset Board
              </button>

              <button className="reset" onClick={() => this.selectNodes()}>
                Select Nodes
              </button>
            </div>

            <div id="rightSide">
              <h5 id="currentalgo">Current Alogrithm : Djikstra </h5>
              <h5 id="currentpattern">Current Pattern : none </h5>
              <h5 id="totalDistance">Total Distance: 0 </h5>
              <h5 id="totalTime">Total Time: 0 </h5>
            </div>
          </div>
        </div>

        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>

        <h5>Total Distance assumes 1 Node = 1 KM</h5>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 26; row++) {
    const currentRow = [];
    for (let col = 0; col < 80; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
