export type DatasetType = 'xor' | 'circle' | 'gaussian';

export interface DataPoint {
  x: number;
  y: number;
  label: number;
}

export function generateDataset(type: DatasetType, numPoints: number = 300): DataPoint[] {
  const points: DataPoint[] = [];
  
  if (type === 'xor') {
    for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const padding = 0.1;
        if (Math.abs(x) < padding || Math.abs(y) < padding) {
          i--;
          continue;
        }
        const label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : 0;
        points.push({ x, y, label });
    }
  } else if (type === 'circle') {
    for (let i = 0; i < numPoints; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const radius = Math.sqrt(x*x + y*y);
        const label = radius < 0.6 ? 1 : 0;
        // Add noise to radius? 
        points.push({ x, y, label });
    }
  } else if (type === 'gaussian') {
    for (let i = 0; i < numPoints; i++) {
      const label = i < numPoints/2 ? 1 : 0;
      const mx = label === 1 ? 0.4 : -0.4;
      const my = label === 1 ? 0.4 : -0.4;
      const x = randomNormal(mx, 0.2);
      const y = randomNormal(my, 0.2);
      points.push({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), label });
    }
  }
  
  return points;
}

function randomNormal(mean: number, std: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  const n01 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return n01 * std + mean;
}
