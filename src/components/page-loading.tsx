import { cn } from "@/utils/cn.ts";

interface PageLoadingProps {
  className?: string;
  children?: string;
  size?: "small" | "medium" | "large";
}

export function PageLoading({
  className,
  children = "加载中...",
  size = "medium",
}: PageLoadingProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen gap-4",
        className,
      )}
    >
      <div
        className={cn(
          "border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin",
          sizeClasses[size],
        )}
      />
      {children && <p className="text-gray-600 font-medium">{children}</p>}
    </div>
  );
}
