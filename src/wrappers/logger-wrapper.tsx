import { type ReactNode, useEffect } from "react";

interface LoggerWrapperProps {
  children: ReactNode;
}

/**
 * 日志记录Wrapper - 演示Wrapper功能
 */
const LoggerWrapper = ({ children }: LoggerWrapperProps) => {
  useEffect(() => {
    console.log("[LoggerWrapper] 页面已加载");
    return () => {
      console.log("[LoggerWrapper] 页面即将卸载");
    };
  }, []);

  return <>{children}</>;
};

export default LoggerWrapper;
