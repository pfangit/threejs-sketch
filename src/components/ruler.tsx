import { type CSSProperties, useEffect, useRef } from "react";

export const RULER_THICKNESS = 24;

interface RulerProps {
  type: "horizontal" | "vertical";
  pixelsPerUnit: number;
  originPixel: number;
  containerSize: number;
}

/**
 * 标尺组件
 *
 * 在画布边缘渲染一个可缩放的标尺，用于显示坐标刻度。
 * 支持水平和垂直两种方向，根据像素比例自动调整刻度密度。
 *
 * @param type - 标尺类型："horizontal" 为水平标尺，"vertical" 为垂直标尺
 * @param pixelsPerUnit - 每单位长度的像素数，用于控制标尺的缩放比例
 * @param originPixel - 原点位置（单位：像素），标尺的 0 刻度对应的像素位置
 * @param containerSize - 容器尺寸（单位：像素），水平时为宽度，垂直时为高度
 */
export function Ruler({
  type,
  pixelsPerUnit,
  originPixel,
  containerSize,
}: RulerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 初始化并绘制标尺内容
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isHorizontal = type === "horizontal";
    const length = containerSize;

    // 处理高 DPI 屏幕，确保标尺清晰
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (isHorizontal ? length : RULER_THICKNESS) * dpr;
    canvas.height = (isHorizontal ? RULER_THICKNESS : length) * dpr;
    canvas.style.width = `${isHorizontal ? length : RULER_THICKNESS}px`;
    canvas.style.height = `${isHorizontal ? RULER_THICKNESS : length}px`;
    ctx.scale(dpr, dpr);

    // 绘制标尺背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#2d2d2d";
    ctx.fillRect(
      0,
      0,
      isHorizontal ? length : RULER_THICKNESS,
      isHorizontal ? RULER_THICKNESS : length,
    );

    // 配置刻度样式
    ctx.strokeStyle = "#666";
    ctx.fillStyle = "#aaa";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const unitsPerPixel = 1 / pixelsPerUnit;

    // 根据缩放比例动态调整主刻度和次刻度的间距
    let majorStep = 50;
    let minorStep = 10;

    if (pixelsPerUnit < 0.5) {
      majorStep = 100;
      minorStep = 20;
    } else if (pixelsPerUnit < 1) {
      majorStep = 50;
      minorStep = 10;
    } else if (pixelsPerUnit < 2) {
      majorStep = 20;
      minorStep = 5;
    } else if (pixelsPerUnit < 5) {
      majorStep = 10;
      minorStep = 2;
    } else if (pixelsPerUnit < 10) {
      majorStep = 5;
      minorStep = 1;
    } else {
      majorStep = 2;
      minorStep = 0.5;
    }

    // 计算可见区域的起始和结束世界坐标
    const worldStart =
      Math.floor(((0 - originPixel) * unitsPerPixel) / majorStep) * majorStep -
      majorStep;
    const worldEnd =
      Math.ceil(((length - originPixel) * unitsPerPixel) / majorStep) *
        majorStep +
      majorStep;

    // 遍历所有刻度位置并绘制
    for (
      let worldPos = worldStart;
      worldPos <= worldEnd;
      worldPos += minorStep
    ) {
      const pixelPos = originPixel + worldPos * pixelsPerUnit;

      if (pixelPos < 0 || pixelPos > length) continue;

      const isMajor = Math.abs(worldPos % majorStep) < 0.001;

      // 根据方向绘制水平或垂直刻度
      if (isHorizontal) {
        if (isMajor) {
          ctx.beginPath();
          ctx.moveTo(pixelPos, RULER_THICKNESS);
          ctx.lineTo(pixelPos, RULER_THICKNESS - 12);
          ctx.stroke();

          ctx.fillText(String(Math.round(worldPos)), pixelPos, 8);
        } else {
          ctx.beginPath();
          ctx.moveTo(pixelPos, RULER_THICKNESS);
          ctx.lineTo(pixelPos, RULER_THICKNESS - 6);
          ctx.stroke();
        }
      } else {
        if (isMajor) {
          ctx.beginPath();
          ctx.moveTo(RULER_THICKNESS, pixelPos);
          ctx.lineTo(RULER_THICKNESS - 12, pixelPos);
          ctx.stroke();

          ctx.save();
          ctx.translate(8, pixelPos);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(String(Math.round(worldPos)), 0, 0);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.moveTo(RULER_THICKNESS, pixelPos);
          ctx.lineTo(RULER_THICKNESS - 6, pixelPos);
          ctx.stroke();
        }
      }
    }
  }, [type, pixelsPerUnit, originPixel, containerSize]);

  const canvasStyle: CSSProperties = {
    display: "block",
  };

  // 渲染水平标尺
  if (type === "horizontal") {
    return (
      <div
        className="bg-[#2d2d2d] shrink-0"
        style={{ height: RULER_THICKNESS, marginLeft: RULER_THICKNESS }}
      >
        <canvas ref={canvasRef} style={canvasStyle} />
      </div>
    );
  }

  // 渲染垂直标尺
  return (
    <div
      className="bg-[#2d2d2d] shrink-0 absolute left-0 top-0"
      style={{ width: RULER_THICKNESS, height: "100%" }}
    >
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
}
