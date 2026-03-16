import { lazy, Suspense } from "react";
import { Navigate, Outlet, useRouteError } from "react-router";
import { createBrowserRouter, type RouteObject } from "react-router-dom";
import AuthWrapper from "@/wrappers/auth-wrapper";
import routes, { type RouteConfig } from "../../config/routes.ts";
import { settings } from "../../config/settings.ts";

const exception = {
  403: "/src/pages/exception/exception-403",
  404: "/src/pages/exception/exception-404",
  500: "/src/pages/exception/exception-500",
};

const pages = import.meta.glob([
  "/src/{pages,layouts}/*.{ts,tsx,js,jsx}",
  "/src/{pages,layouts}/**/*.{ts,tsx,js,jsx}",
  "!**/{components,utils,services}",
  "!**/{utils,util,services}.{ts,tsx,js,jsx}",
  "!**/*.{d.ts,json}",
]);

const metaPages = Object.entries(pages).reduce((prev, [key, val]) => {
  return {
    ...prev,
    [key.replace(/(\/index)?\.tsx$/, "")]: val,
  };
}, {} as any);

// 未授权页面
const UnauthorizedPage = lazy(() => import("@/pages/unauthorized.tsx"));

// 加载指示器组件
const LoadingIndicator = () => <div>loading</div>;

const parsePath = (path?: string, basePath: string = "") => {
  if (!path) {
    return "";
  }
  // 处理路径别名
  let normalizedPath = path;
  const pathPrefix = `/src/${basePath}`;
  // 优先处理 @/ 别名
  if (path.startsWith("@/")) {
    normalizedPath = path.replace("@/", pathPrefix);
  }
  // 处理绝对路径（相对于 src 目录）
  else if (path.startsWith("/")) {
    normalizedPath = path;
  }
  // 处理 ./ 相对路径（假设相对于 src 目录）
  else if (path.startsWith("./")) {
    normalizedPath = path.replace(/^\.\//, pathPrefix);
  }
  // 其他情况（不带前缀），也假设相对于 src 目录
  else {
    normalizedPath = `${pathPrefix}/${path}`;
  }
  // 尝试匹配 metaPages 中的路径
  const matchedPath = Object.keys(metaPages).find(
    (key) => key === normalizedPath || key === `${normalizedPath}/index`,
  );
  if (matchedPath) {
    return normalizedPath;
  }

  console.warn(`No matching path found for ${path} ${normalizedPath}`);
  return "";
};

const parseRoute = (route: RouteConfig) => {
  const { layout, index, path, redirect, component, children } = route;

  let page: string | undefined;
  let pageFile: string | undefined;

  if (typeof layout === "string") {
    pageFile = parsePath(layout);
    page = metaPages[pageFile];
  } else if (component) {
    pageFile = parsePath(component, "pages/");
    page = metaPages[pageFile];
  }
  const hasChildren = children && children.length > 0;
  // 先确定是否有页面，如果没有页面，确定含不含子，如果不含子，使用404页面
  const element = page ?? (hasChildren ? undefined : metaPages[exception[404]]);

  return {
    ...(index ? { index } : { path }),
    ...(redirect ? { element: <Navigate to={redirect} replace /> } : {}),
    ErrorBoundary: () => {
      const error = useRouteError();
      console.log("ErrorBoundary", error);
      return null;
    },
    HydrateFallback: () => {
      const error = useRouteError();
      console.log("HydrateFallback", error);
      return null;
    },
    ...(children
      ? {
          children: buildRoutes(children),
        }
      : {}),
    ...(layout === false ? { handle: { layout: false } } : {}),
    lazy: element
      ? async () => {
          const { default: Component } = await element();
          return {
            Component: () => (
              <AuthWrapper route={route}>
                <Component />
              </AuthWrapper>
            ),
          };
        }
      : hasChildren
        ? async () => <Outlet />
        : undefined,
  } as RouteObject;
};

// 创建路由配置
const buildRoutes = (items: RouteConfig[]): RouteObject[] => {
  return items.map((route) => parseRoute(route));
};

export const router = createBrowserRouter(
  [
    ...buildRoutes(routes),
    {
      path: `unauthorized`,
      element: (
        <Suspense fallback={<LoadingIndicator />}>
          <UnauthorizedPage />
        </Suspense>
      ),
    },
  ],
  {
    basename: settings.path,
  },
);
