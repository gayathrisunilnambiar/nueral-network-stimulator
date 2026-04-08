export interface CanvasPoint {
  x: number;
  y: number;
}

interface LayerLike {
  neurons: unknown[];
}

export function resizeCanvasToDisplaySize(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function getLayerPositions(
  layers: LayerLike[],
  width: number,
  height: number,
  marginX: number,
  marginY: number,
): CanvasPoint[][] {
  const layerSpacing = layers.length === 1 ? 0 : (width - marginX * 2) / (layers.length - 1);

  return layers.map((layer, layerIndex) => {
    const neuronSpacing =
      layer.neurons.length === 1 ? 0 : (height - marginY * 2) / (layer.neurons.length - 1);
    const centerY = height / 2;
    const startY = layer.neurons.length === 1 ? centerY : marginY;

    return layer.neurons.map((_, neuronIndex) => ({
      x: marginX + layerIndex * layerSpacing,
      y: layer.neurons.length === 1 ? centerY : startY + neuronIndex * neuronSpacing,
    }));
  });
}

export function drawLayerTitles(
  context: CanvasRenderingContext2D,
  layers: LayerLike[],
  layout: CanvasPoint[][],
) {
  context.fillStyle = "rgba(226, 232, 240, 0.85)";
  context.font = "600 12px ui-sans-serif, system-ui, sans-serif";
  context.textAlign = "center";

  layers.forEach((layer, layerIndex) => {
    const label =
      layerIndex === 0
        ? "Input"
        : layerIndex === layers.length - 1
          ? "Output"
          : `Hidden ${layerIndex}`;
    context.fillText(label, layout[layerIndex][0].x, 30);
  });
}

export function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

export function easeInOut(value: number) {
  return value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2;
}
