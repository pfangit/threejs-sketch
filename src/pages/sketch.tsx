import { useEffect } from "react";
import { RULER_THICKNESS, Ruler } from "@/components/ruler.tsx";
import { useSketch as useSketchContext } from "@/contexts/sketch-context.tsx";
import { useSketch as useSketchHook } from "@/hooks/use-sketch";

function Sketch() {
  const { pageData } = useSketchContext();
  const {
    containerRef,
    gridCanvasRef,
    pixelsPerUnit,
    originPixelX,
    originPixelY,
    containerWidth,
    containerHeight,
    zoomPercent,
    renderPage,
  } = useSketchHook();

  // 当 pageData 变化时，渲染图层
  useEffect(() => {
    if (pageData?.layers) {
      renderPage(pageData);
    }
  }, [pageData, renderPage]);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Ruler
          type="horizontal"
          pixelsPerUnit={pixelsPerUnit}
          originPixel={originPixelX}
          containerSize={containerWidth}
        />
        <div className="flex-1 relative">
          <Ruler
            type="vertical"
            pixelsPerUnit={pixelsPerUnit}
            originPixel={originPixelY}
            containerSize={containerHeight}
          />
          <canvas
            ref={gridCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ left: RULER_THICKNESS }}
          />
          <div
            ref={containerRef}
            className="absolute inset-0"
            style={{ left: RULER_THICKNESS }}
          />
        </div>
        <div className="absolute bottom-3 left-3 bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs flex items-center gap-3 z-10">
          <span className="font-medium">{zoomPercent}%</span>
          <span className="text-gray-400 text-[10px]">
            点击选中 | 拖拽移动 | 拖拽平移 | 滚轮缩放
          </span>
        </div>
      </div>
    </div>
  );
}

export default Sketch;
