export function parsePointString(pointStr: string): { x: number; y: number } {
  const match = pointStr.match(/\{([^,]+),\s*([^}]+)\}/);
  if (match) {
    return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  }
  return { x: 0, y: 0 };
}
