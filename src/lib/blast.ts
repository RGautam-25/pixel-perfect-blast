export const GRID = 8;

export type Cell = number | null; // color index
export type Board = Cell[][];

export type Shape = { cells: [number, number][]; w: number; h: number };

export type Piece = { id: string; shape: Shape; color: number };

const RAW: number[][][] = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 1],
  ],
  [
    [1, 1],
    [1, 0],
  ],
  [
    [1, 1],
    [0, 1],
  ],
  [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
];

export const SHAPES: Shape[] = RAW.map((m) => {
  const cells: [number, number][] = [];
  m.forEach((row, r) => row.forEach((v, c) => v && cells.push([r, c])));
  return { cells, h: m.length, w: m[0].length };
});

export const COLORS = 6;

export const emptyBoard = (): Board =>
  Array.from({ length: GRID }, () => Array.from({ length: GRID }, () => null as Cell));

let seq = 0;
export const randomPiece = (): Piece => ({
  id: `p${seq++}-${Math.random().toString(36).slice(2, 7)}`,
  shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  color: Math.floor(Math.random() * COLORS),
});

export const newTray = (): Piece[] => [randomPiece(), randomPiece(), randomPiece()];

export function canPlace(board: Board, shape: Shape, r0: number, c0: number) {
  return shape.cells.every(([r, c]) => {
    const r1 = r0 + r;
    const c1 = c0 + c;
    return r1 >= 0 && c1 >= 0 && r1 < GRID && c1 < GRID && board[r1][c1] === null;
  });
}

export function hasAnyMove(board: Board, pieces: Piece[]) {
  return pieces.some((p) => {
    for (let r = 0; r < GRID; r++)
      for (let c = 0; c < GRID; c++) if (canPlace(board, p.shape, r, c)) return true;
    return false;
  });
}

export function place(board: Board, piece: Piece, r0: number, c0: number): Board {
  const next = board.map((row) => row.slice());
  piece.shape.cells.forEach(([r, c]) => {
    next[r0 + r][c0 + c] = piece.color;
  });
  return next;
}

export type ClearResult = {
  board: Board;
  clearedCells: string[];
  lines: number;
};

export function clearLines(board: Board): ClearResult {
  const rows: number[] = [];
  const cols: number[] = [];
  for (let r = 0; r < GRID; r++) if (board[r].every((v) => v !== null)) rows.push(r);
  for (let c = 0; c < GRID; c++)
    if (board.every((row) => row[c] !== null)) cols.push(c);

  const cleared = new Set<string>();
  rows.forEach((r) => {
    for (let c = 0; c < GRID; c++) cleared.add(`${r}-${c}`);
  });
  cols.forEach((c) => {
    for (let r = 0; r < GRID; r++) cleared.add(`${r}-${c}`);
  });

  const next = board.map((row, r) => row.map((v, c) => (cleared.has(`${r}-${c}`) ? null : v)));
  return { board: next, clearedCells: [...cleared], lines: rows.length + cols.length };
}
