import { ChevronDown, ChevronRight, FileText, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import SketchObjectItem from "@/components/sketch-object-item.tsx";
import { useSketch } from "@/contexts/sketch-context.tsx";

export function LeftPanel() {
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [pagesExpanded, setPagesExpanded] = useState(true);
  const [layerMaxHeight, setLayerMaxHeight] = useState(0);
  const { sketchInfo, viewPage, setViewPage } = useSketch();

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const pagesSectionRef = useRef<HTMLDivElement>(null);

  // 计算图层区域的最大高度
  useEffect(() => {
    const calculateLayerHeight = () => {
      if (leftPanelRef.current && pagesSectionRef.current) {
        const leftPanelHeight = leftPanelRef.current.offsetHeight;
        const pagesSectionHeight = pagesSectionRef.current.offsetHeight;
        const layerHeight = leftPanelHeight - pagesSectionHeight;
        setLayerMaxHeight(layerHeight > 0 ? layerHeight : 0);
      }
    };

    // 初始化计算
    calculateLayerHeight();

    // 监听窗口大小变化
    window.addEventListener("resize", calculateLayerHeight);

    return () => {
      window.removeEventListener("resize", calculateLayerHeight);
    };
  }, []);

  return (
    <div
      ref={leftPanelRef}
      className="w-60 bg-gray-900 border-r border-gray-700 flex flex-col h-full overflow-hidden"
    >
      {/* 上面部分：Sketch Pages 列表 */}
      <div
        ref={pagesSectionRef}
        className="h-50 border-b border-gray-700 flex flex-col"
      >
        <div className="p-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <FileText size={16} />
            页面
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div
              onClick={() => setPagesExpanded(!pagesExpanded)}
              className="w-full flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded"
            >
              {pagesExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              <span>页面列表</span>
            </div>
            {pagesExpanded && (
              <div className="mt-1 space-y-0.5">
                {sketchInfo.pages.map((page) => (
                  <div
                    key={page.id}
                    onClick={() => setViewPage(page)}
                    className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-left ${
                      page.id === viewPage?.id
                        ? "bg-blue-600/30 border border-blue-500/50"
                        : "hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <span className="text-gray-400">
                      <FileText size={14} />
                    </span>
                    <span className="flex-1 text-xs truncate text-gray-300">
                      {page.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下面部分：图层列表 */}
      <div
        className="flex-1 border-b border-gray-700 flex flex-col"
        style={{ maxHeight: `${layerMaxHeight}px` }}
      >
        <div className="p-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
            <Layers size={16} />
            图层
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div
              onClick={() => setLayersExpanded(!layersExpanded)}
              className="w-full flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded"
            >
              {layersExpanded ? (
                <ChevronDown size={12} />
              ) : (
                <ChevronRight size={12} />
              )}
              <span>图层列表</span>
            </div>
            {layersExpanded && (
              <div className="mt-1 space-y-0.5">
                <SketchObjectItem />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
