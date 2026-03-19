import type FileFormat from "@sketch-hq/sketch-file-format-ts";
import JSZip from "jszip";
import { useCallback, useRef, useState } from "react";
import { type SketchInfo, useSketch } from "@/contexts/sketch-context.tsx";

const Menu = () => {
  const { setSketchInfo } = useSketch();
  const [metaInfo, setMetaInfo] = useState<FileFormat.Meta | null>(null);

  const zipData = useRef<JSZip>(null);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".sketch";

    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      let meta: FileFormat.Meta | null = null;
      let document: FileFormat.Document | null = null;
      let user: FileFormat.User | null = null;
      const pages: SketchInfo["pages"] | null = [];
      if (file) {
        try {
          const zip = new JSZip();
          zipData.current = await zip.loadAsync(file);

          // 遍历 ZIP 包内的所有文件
          for (const [relativePath, fileEntry] of Object.entries(
            zipData.current.files,
          )) {
            // 跳过文件夹
            if (fileEntry.dir) continue;

            try {
              if (relativePath.endsWith(".json")) {
                // 4. 读取并解析 JSON 文件
                // JSON 文件包含了 Sketch 的文档结构、图层信息等
                const jsonString = await fileEntry.async("string");
                const jsonData = JSON.parse(jsonString);
                switch (relativePath) {
                  case "meta.json":
                    setMetaInfo(jsonData);
                    meta = jsonData;
                    break;
                  case "user.json":
                    user = jsonData;
                    break;
                  case "document.json":
                    document = jsonData;
                    break;
                }
                console.log(`JSON 文件: ${relativePath}`, jsonData);
              }
              // 你可以根据需要处理其他类型的文件，例如图片
              // else if (relativePath.startsWith('images/')) {
              //   const imageBlob = await fileEntry.async('blob');
              //   console.log(`图片文件: ${relativePath}`, imageBlob);
              // }
            } catch (err) {
              console.error(`解析文件失败: ${relativePath}`, err);
            }
          }

          if (meta) {
            Object.keys(meta.pagesAndArtboards).forEach((pageId) => {
              const pagesAndArtboard = meta!.pagesAndArtboards[pageId];
              const pageInfo: { scrollOrigin: string; zoomValue: number } =
                user?.[pageId];
              pages.push({
                name: pagesAndArtboard.name,
                id: pageId,
                ...pageInfo,
              });
            });
          }

          setSketchInfo({
            meta: meta,
            user: user,
            pages: pages,
            document: document,
            zipData: zipData.current,
          });
          // 这里可以根据需要处理解压后的文件
          // 例如读取 JSON 文件、图片等
        } catch (error) {
          console.error("Error unzipping file:", error);
        }
      }
    };

    input.click();
  }, [setSketchInfo]);

  return (
    <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between w-full">
      <div
        className="px-4 hover:bg-gray-700 rounded"
        onClick={handleFileSelect}
      >
        选择文件
      </div>
      {metaInfo && (
        <div className="flex items-center space-x-4 text-sm">
          <span>版本: {metaInfo.version}</span>
          <span>Sketch版本: {metaInfo.appVersion}</span>
          <span>Build: {metaInfo.build}</span>
        </div>
      )}
    </div>
  );
};

export default Menu;
