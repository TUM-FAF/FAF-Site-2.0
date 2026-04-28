// 7 cols × 4 rows, each cell is 4×4 px → shield is 28×16 px
// Classic arch shape with gun port notch at bottom center
const INIT_SHAPE = [
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 1, 1],
];

const CELL = 4;

export class Shield {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.cols = 7;
    this.rows = 4;
    this.cells = INIT_SHAPE.map(r => [...r]);
  }

  get alive() {
    return this.cells.some(r => r.some(c => c > 0));
  }

  // AABB bounds check
  overlaps(bx, by) {
    const hw = (this.cols * CELL) / 2;
    const hh = (this.rows * CELL) / 2;
    return bx >= this.x - hw && bx <= this.x + hw &&
           by >= this.y - hh && by <= this.y + hh;
  }

  // Destroy the cell under the bullet and splash neighbors randomly
  hit(bx, by) {
    const x0 = this.x - (this.cols * CELL) / 2;
    const y0 = this.y - (this.rows * CELL) / 2;
    const cx = Math.floor((bx - x0) / CELL);
    const cy = Math.floor((by - y0) / CELL);
    if (cx < 0 || cx >= this.cols || cy < 0 || cy >= this.rows) return false;
    if (!this.cells[cy][cx]) return false;

    this.cells[cy][cx] = 0;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows && this.cells[ny][nx]) {
        if (Math.random() < 0.28) this.cells[ny][nx] = 0;
      }
    }
    return true;
  }

  render(ctx) {
    const x0 = Math.round(this.x - (this.cols * CELL) / 2);
    const y0 = Math.round(this.y - (this.rows * CELL) / 2);
    ctx.fillStyle = '#0099ff';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c]) {
          ctx.fillRect(x0 + c * CELL, y0 + r * CELL, CELL - 1, CELL - 1);
        }
      }
    }
  }
}
