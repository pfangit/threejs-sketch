import {
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  Hexagon,
  Layers,
  Lock,
  Square,
  Triangle,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import type { SceneObject } from "@/types";

export function LeftPanel({
  objects,
  onObjectSelect,
  onObjectToggleVisibility,
  onObjectToggleLock,
}: {
  objects: SceneObject[];
  onObjectSelect: (id: string) => void;
  onObjectToggleVisibility: (id: string) => void;
  onObjectToggleLock: (id: string) => void;
}) {
  const [layersExpanded, setLayersExpanded] = useState(true);

  const getIcon = (type: string) => {
    switch (type) {
      case "rect":
        return <Square size={14} />;
      case "circle":
        return <Circle size={14} />;
      case "triangle":
        return <Triangle size={14} />;
      case "shapePath":
        return <Hexagon size={14} />;
      default:
        return <Square size={14} />;
    }
  };

  return (
    <div className="w-60 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Layers size={16} />
          图层
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button
            type="button"
            onClick={() => setLayersExpanded(!layersExpanded)}
            className="w-full flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded"
          >
            {layersExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
            <span>图层列表</span>
            <span className="ml-auto text-gray-500">{objects.length}</span>
          </button>
          {layersExpanded && (
            <div className="mt-1 space-y-0.5">
              {objects.map((obj) => (
                <button
                  type="button"
                  key={obj.id}
                  className={`group w-full flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-left ${
                    obj.selected
                      ? "bg-blue-600/30 border border-blue-500/50"
                      : "hover:bg-gray-800 border border-transparent"
                  }`}
                  onClick={() => onObjectSelect(obj.id)}
                >
                  <span className="text-gray-400">{getIcon(obj.type)}</span>
                  <span
                    className={`flex-1 text-xs truncate ${
                      obj.selected ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {obj.name}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onObjectToggleVisibility(obj.id);
                      }}
                      className="p-0.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
                      title={obj.visible ? "隐藏" : "显示"}
                    >
                      {obj.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onObjectToggleLock(obj.id);
                      }}
                      className="p-0.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
                      title={obj.locked ? "解锁" : "锁定"}
                    >
                      {obj.locked ? <Lock size={12} /> : <Unlock size={12} />}
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
