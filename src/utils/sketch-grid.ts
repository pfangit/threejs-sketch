export function drawGrid(
  canvas: HTMLCanvasElement | null,
  ppu: number,
  ox: number,
  oy: number,
  w: number,
  h: number,
) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, w, h);

  const unitsPerPixel = 1 / ppu;

  let majorStep = 50;
  let minorStep = 10;

  if (ppu < 0.5) {
    majorStep = 100;
    minorStep = 20;
  } else if (ppu < 1) {
    majorStep = 50;
    minorStep = 10;
  } else if (ppu < 2) {
    majorStep = 20;
    minorStep = 5;
  } else if (ppu < 5) {
    majorStep = 10;
    minorStep = 2;
  } else if (ppu < 10) {
    majorStep = 5;
    minorStep = 1;
  } else {
    majorStep = 2;
    minorStep = 0.5;
  }

  const worldLeft = (0 - ox) * unitsPerPixel;
  const worldRight = (w - ox) * unitsPerPixel;
  const worldTop = (0 - oy) * unitsPerPixel;
  const worldBottom = (h - oy) * unitsPerPixel;

  const startX = Math.floor(worldLeft / minorStep) * minorStep;
  const endX = Math.ceil(worldRight / minorStep) * minorStep;
  const startY = Math.floor(worldTop / minorStep) * minorStep;
  const endY = Math.ceil(worldBottom / minorStep) * minorStep;

  ctx.strokeStyle = "#222222";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let wx = startX; wx <= endX; wx += minorStep) {
    const px = ox + wx * ppu;
    if (px >= 0 && px <= w) {
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
    }
  }

  for (let wy = startY; wy <= endY; wy += minorStep) {
    const py = oy + wy * ppu;
    if (py >= 0 && py <= h) {
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
    }
  }
  ctx.stroke();

  ctx.strokeStyle = "#444444";
  ctx.lineWidth = 1;
  ctx.beginPath();

  const majorStartX = Math.floor(worldLeft / majorStep) * majorStep;
  const majorEndX = Math.ceil(worldRight / majorStep) * majorStep;
  const majorStartY = Math.floor(worldTop / majorStep) * majorStep;
  const majorEndY = Math.ceil(worldBottom / majorStep) * majorStep;

  for (let wx = majorStartX; wx <= majorEndX; wx += majorStep) {
    const px = ox + wx * ppu;
    if (px >= 0 && px <= w) {
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
    }
  }

  for (let wy = majorStartY; wy <= majorEndY; wy += majorStep) {
    const py = oy + wy * ppu;
    if (py >= 0 && py <= h) {
      ctx.moveTo(0, py);
      ctx.lineTo(w, py);
    }
  }
  ctx.stroke();

  ctx.strokeStyle = "#666666";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const originPx = ox;
  const originPy = oy;
  if (originPx >= 0 && originPx <= w) {
    ctx.moveTo(originPx, 0);
    ctx.lineTo(originPx, h);
  }
  if (originPy >= 0 && originPy <= h) {
    ctx.moveTo(0, originPy);
    ctx.lineTo(w, originPy);
  }
  ctx.stroke();
}
