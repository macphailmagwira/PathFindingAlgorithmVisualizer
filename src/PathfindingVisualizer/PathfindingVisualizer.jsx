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

    document.addEventListener('click', this.handleClickOutside);
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
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
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

            <nav role="navigation" class="primary-navigation">
              <ul>
                <li>
                  <button>Algorithms</button>
                  <ul class="dropdown">
                    <li>
                      <button href="#">Dijkstra</button>
                    </li>
                    <li>
                      <button href="#">Depth First</button>
                    </li>
                    <li>
                      <button href="#">Breadth First</button>
                    </li>
                    <li>
                      <button href="#">Swarm</button>
                    </li>
                  </ul>
                </li>
                <li>
                  <button href="#">Maizes and Patterns</button>
                  <ul class="dropdown">
                    <li>
                      <button href="#">Random Maze</button>
                    </li>
                    <li>
                      <button href="#">Recursive division</button>
                    </li>
                  </ul>
                </li>
              </ul>
            </nav>

            <div id="middle">
              <button
                type="button"
                class="btn btn-primary"
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
