import type FileFormat from "@sketch-hq/sketch-file-format-ts";
import type JSZip from "jszip";
import {
  createContext,
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

export type SketchObject = (FileFormat.AnyLayer | FileFormat.AnyGroup) & {
  selected?: boolean;
};

export interface ViewPage {
  scrollOrigin: string;
  zoomValue: number;
  id: string;
  name: string;
}
export interface SketchInfo {
  meta: FileFormat.Meta | null;
  user: FileFormat.User | null;
  document: FileFormat.Document | null;
  zipData: JSZip | null;
  pages: ViewPage[];
}

interface SketchContextType {
  sketchInfo: SketchInfo;
  setSketchInfo: Dispatch<SetStateAction<SketchInfo>>;
  viewPage: ViewPage | undefined;
  pageData: FileFormat.Page | undefined;
  setViewPage: Dispatch<SetStateAction<ViewPage | undefined>>;
  selectedObject: SketchObject | undefined;
  setSelectedObject: Dispatch<SetStateAction<SketchObject | undefined>>;
  updateObjectVisibility: (objectId: string, visible: boolean) => void;
}

const defaultSketchInfo: SketchInfo = {
  meta: null,
  user: null,
  document: null,
  zipData: null,
  pages: [],
};

const SketchContext = createContext<SketchContextType | undefined>(undefined);

export const SketchProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [sketchInfo, setSketchInfo] = useState<SketchInfo>(defaultSketchInfo);
  const [viewPage, setViewPage] = useState<ViewPage | undefined>(undefined);
  const [pageData, setPageData] = useState<FileFormat.Page | undefined>(
    undefined,
  );
  const [selectedObject, setSelectedObject] = useState<SketchObject | undefined>(
    undefined,
  );

  const loadPage = async (page: ViewPage | undefined) => {
    if (page) {
      const fileEntry = sketchInfo.zipData!.files[`pages/${page.id}.json`];
      const jsonString = await fileEntry.async("string");
      const jsonData = JSON.parse(jsonString) as FileFormat.Page;
      // jsonData.layers = parseFrame(jsonData.layers, jsonData.frame);
      setPageData(jsonData);
    }
    // const jsonString = await fileEntry.async("string");
    // const jsonData = JSON.parse(jsonString);
  };

  const updateObjectVisibility = (objectId: string, visible: boolean) => {
    if (!pageData) return;

    // 递归更新对象的可见性
    const updateVisibility = (layers: (FileFormat.AnyGroup | FileFormat.AnyLayer)[]): FileFormat.AnyObject[] => {
      // @ts-expect-error
      return layers.map((layer) => {
        if (layer.do_objectID === objectId) {
          return { ...layer, isVisible: visible };
        }
        if ('layers' in layer) {
          return {
            ...layer,
            layers: updateVisibility(layer.layers),
          };
        }
        return layer;
      });
    };

    const updatedPageData = {
      ...pageData,
      layers: updateVisibility(pageData.layers),
    };

    // @ts-expect-error
    setPageData(updatedPageData);
  };

  useEffect(() => {
    loadPage(viewPage).then();
  }, [viewPage]);

  return (
    <SketchContext.Provider
      value={{ sketchInfo, setSketchInfo, viewPage, setViewPage, pageData, selectedObject, setSelectedObject, updateObjectVisibility }}
    >
      {children}
    </SketchContext.Provider>
  );
};

export const useSketch = (): SketchContextType => {
  const context = useContext(SketchContext);
  if (context === undefined) {
    throw new Error("useSketch must be used within a SketchProvider");
  }
  return context;
};
