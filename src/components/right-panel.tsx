import type { SceneObject } from "@/types";

export function RightPanel({
  selectedObject,
  onPropertyChange,
}: {
  selectedObject: SceneObject | null;
  onPropertyChange: (id: string, property: string, value: unknown) => void;
}) {
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
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor={`pos-x-${selectedObject.id}`}
                className="block text-xs text-gray-500 mb-1"
              >
                X
              </label>
              <input
                id={`pos-x-${selectedObject.id}`}
                type="number"
                value={selectedObject.position.x.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange(
                    selectedObject.id,
                    "x",
                    parseFloat(e.target.value),
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor={`pos-y-${selectedObject.id}`}
                className="block text-xs text-gray-500 mb-1"
              >
                Y
              </label>
              <input
                id={`pos-y-${selectedObject.id}`}
                type="number"
                value={selectedObject.position.y.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange(
                    selectedObject.id,
                    "y",
                    parseFloat(e.target.value),
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor={`pos-z-${selectedObject.id}`}
                className="block text-xs text-gray-500 mb-1"
              >
                Z
              </label>
              <input
                id={`pos-z-${selectedObject.id}`}
                type="number"
                value={selectedObject.position.z.toFixed(2)}
                onChange={(e) =>
                  onPropertyChange(
                    selectedObject.id,
                    "z",
                    parseFloat(e.target.value),
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            外观
          </h3>
          <div>
            <label
              htmlFor={`color-${selectedObject.id}`}
              className="block text-xs text-gray-500 mb-1"
            >
              颜色
            </label>
            <div className="flex gap-2">
              <input
                id={`color-${selectedObject.id}`}
                type="color"
                value={selectedObject.color}
                onChange={(e) =>
                  onPropertyChange(selectedObject.id, "color", e.target.value)
                }
                className="w-8 h-8 bg-transparent border border-gray-700 rounded cursor-pointer"
              />
              <input
                type="text"
                value={selectedObject.color}
                onChange={(e) =>
                  onPropertyChange(selectedObject.id, "color", e.target.value)
                }
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
              />
            </div>
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
                {selectedObject.type === "rect"
                  ? "矩形"
                  : selectedObject.type === "circle"
                    ? "圆形"
                    : "三角形"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">ID</span>
              <span className="text-gray-300 font-mono text-[10px]">
                {selectedObject.id}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">可见</span>
              <span className="text-gray-300">
                {selectedObject.visible ? "是" : "否"}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">锁定</span>
              <span className="text-gray-300">
                {selectedObject.locked ? "是" : "否"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
