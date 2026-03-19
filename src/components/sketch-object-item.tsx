import {
  ChevronDown,
  ChevronRight,
  Circle,
  Eye,
  EyeOff,
  Hexagon,
  Lock,
  Square,
  Triangle,
  Unlock,
} from "lucide-react";
import { memo, useCallback, useState } from "react";
import {type SketchObject, useSketch} from "@/contexts/sketch-context.tsx";

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

const SketchObjectItemComponent = ({ obj }: { obj: SketchObject }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { selectedObject, setSelectedObject, updateObjectVisibility } = useSketch();

  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSelect = useCallback(() => {
    setSelectedObject(obj);
  }, [obj, setSelectedObject]);

  const handleToggleVisibility = useCallback(() => {
    updateObjectVisibility(obj.do_objectID, !obj.isVisible);
  }, [obj, updateObjectVisibility]);

  // @ts-expect-error layers并非所有obj都有
  const hasChildren = obj.layers && obj.layers.length > 0;

  return (
    <ul key={obj.do_objectID} className="flex flex-col">
      <li
        onClick={handleSelect}
        className={`group w-full flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer text-left ${
          selectedObject?.do_objectID === obj.do_objectID
            ? "bg-blue-600/30 border border-blue-500/50"
            : "hover:bg-gray-800 border border-transparent"
        }`}
      >
        {hasChildren && (
          <span
            onClick={handleToggleExpand}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown size={12} />
            ) : (
              <ChevronRight size={12} />
            )}
          </span>
        )}
        <span className="text-gray-400">{getIcon(obj._class)}</span>
        <span
          className={`flex-1 text-xs truncate ${
            obj.selected ? "text-white" : "text-gray-300"
          }`}
        >
          {obj.name}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleToggleVisibility();
            }}
            className={`p-0.5 hover:bg-gray-700 rounded ${obj.isVisible ? 'text-gray-400' : 'text-gray-600'} hover:text-gray-200`}
            title={obj.isVisible ? "隐藏" : "显示"}
          >
            {obj.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-0.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title={obj.isLocked ? "解锁" : "锁定"}
          >
            {obj.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
          </div>
        </div>
      </li>
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {
            // @ts-expect-error 之前已经判断了是否存在layers
            obj.layers.map((childObj) => (
              <SketchObjectItemComponent
                key={childObj.do_objectID}
                obj={childObj}
              />
            ))
          }
        </div>
      )}
    </ul>
  );
};

const MemoizedSketchObjectItemComponent = memo(SketchObjectItemComponent);

const SketchObjectItem = () => {

  const { pageData } = useSketch();

  return (pageData?.layers || []).map((obj) => (
    <MemoizedSketchObjectItemComponent key={obj.do_objectID} obj={obj} />
  ));
};
export default SketchObjectItem
