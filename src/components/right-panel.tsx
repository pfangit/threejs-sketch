import { useSketch } from "@/contexts/sketch-context.tsx";

export function RightPanel() {
  const { selectedObject } = useSketch();

  if (!selectedObject) {
    return (
      <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
        <div className="p-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-200">属性</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          选择一个对象查看属性
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200">属性</h2>
        <p className="text-xs text-gray-400 mt-1">{selectedObject.name}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            位置
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor={`pos-x-${selectedObject.do_objectID}`}
                className="block text-xs text-gray-500 mb-1"
              >
                X
              </label>
              <input
                id={`pos-x-${selectedObject.do_objectID}`}
                type="number"
                value={selectedObject.frame.x.toFixed(2)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor={`pos-y-${selectedObject.do_objectID}`}
                className="block text-xs text-gray-500 mb-1"
              >
                Y
              </label>
              <input
                id={`pos-y-${selectedObject.do_objectID}`}
                type="number"
                value={selectedObject.frame.y.toFixed(2)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            大小
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor={`width-${selectedObject.do_objectID}`}
                className="block text-xs text-gray-500 mb-1"
              >
                宽度
              </label>
              <input
                id={`width-${selectedObject.do_objectID}`}
                type="number"
                value={selectedObject.frame.width.toFixed(2)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor={`height-${selectedObject.do_objectID}`}
                className="block text-xs text-gray-500 mb-1"
              >
                高度
              </label>
              <input
                id={`height-${selectedObject.do_objectID}`}
                type="number"
                value={selectedObject.frame.height.toFixed(2)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            旋转
          </h3>
          <div>
            <input
              id={`rotation-${selectedObject.do_objectID}`}
              type="number"
              value={selectedObject.rotation?.toFixed(2) || "0"}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            信息
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">类型</span>
              <span className="text-gray-300">
                {selectedObject._class === "group" ? "组" : selectedObject._class}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">ID</span>
              <span className="text-gray-300 font-mono text-[10px]">
                {selectedObject.do_objectID}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">可见</span>
              <span className="text-gray-300">
                {selectedObject.isVisible ? "是" : "否"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">锁定</span>
              <span className="text-gray-300">
                {selectedObject.isLocked ? "是" : "否"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
