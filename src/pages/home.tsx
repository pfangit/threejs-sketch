import { LeftPanel } from "@/components/left-panel.tsx";
import { RightPanel } from "@/components/right-panel.tsx";
import { SketchProvider } from "@/contexts/sketch-context.tsx";
import Menu from "@/pages/menu.tsx";
import Sketch from "@/pages/sketch.tsx";

function HomePageContent() {
  return (
    <div className="flex flex-col h-screen w-full bg-gray-950">
      <Menu />
      <div className="flex flex-1">
        <LeftPanel />
        <div className="flex-1 relative overflow-hidden">
          <Sketch />
        </div>
        <RightPanel />
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <SketchProvider>
      <HomePageContent />
    </SketchProvider>
  );
}

export default HomePage;
