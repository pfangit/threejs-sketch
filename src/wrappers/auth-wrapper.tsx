import { useRequest } from "alova/client";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { PageLoading } from "@/components/page-loading.tsx";
import { type CurrentUser, fetchCurrentUser } from "@/services/auth.ts";
import type { RouteConfig } from "../../config/routes.ts";

export type AuthType = boolean | string | string[] | undefined;

interface AuthWrapperProps {
  children: ReactNode;
  route?: RouteConfig;
}

// 模拟认证状态检查函数
const isAuthenticated = (data: CurrentUser) => {
  // 实际项目中这里会检查 token 或其他认证信息
  return !!data?.uid;
};

// 检查是否有权限访问
const hasPermission = (requireAuth: AuthType, data: CurrentUser): boolean => {
  // 如果不需要认证，则有权限
  if (
    requireAuth === undefined ||
    requireAuth === null ||
    requireAuth === false
  ) {
    return true;
  }

  // 如果只需要登录状态
  if (requireAuth === true) {
    return isAuthenticated(data);
  }

  // 如果需要特定角色，但用户未认证
  if (!isAuthenticated(data)) {
    return false;
  }

  const userRoles = data?.roles || [];

  // 如果是单个角色字符串
  if (typeof requireAuth === "string") {
    return userRoles.includes(requireAuth);
  }

  // 如果是角色数组
  if (Array.isArray(requireAuth)) {
    return requireAuth.some((role) => userRoles.includes(role));
  }

  return false;
};

const AuthWrapper: FC<AuthWrapperProps> = ({ children, route }) => {
  const { auth: requireAuth } = route || {};
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, send } = useRequest(fetchCurrentUser(), {
    initialData: {},
    immediate: false,
  });
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (requireAuth) {
      // 使用 setTimeout 将状态更新移到下一个事件循环周期，避免级联渲染
      timer = setTimeout(() => {
        if (!loading) {
          send().then((data) => {
            console.log("当前用户", data);
            // 检查是否需要认证
            if (!hasPermission(requireAuth, data)) {
              // 检查用户是否已认证
              if (!isAuthenticated(data)) {
                const loginPath = `/auth/?redirect=${window.btoa(window.location.href)}`;

                // 认证检查完成
                setIsChecking(false);
                // 重定向到登录页，同时保存尝试访问的完整页面地址（包括查询参数）
                navigate(loginPath, {
                  state: { from: location.pathname + location.search },
                  replace: true,
                });
              } else {
                // 用户已认证但没有权限，可以重定向到无权限页面
                navigate(`/unauthorized`, {
                  replace: true,
                });
              }
              return;
            }

            // 认证检查完成
            setIsChecking(false);
          });
        }
      });
    }

    setIsChecking(false);

    return () => clearTimeout(timer);
  }, [requireAuth, navigate, location, loading]);

  // 如果还在检查认证状态，显示加载指示器
  if (isChecking || loading) {
    return <PageLoading>认证中...</PageLoading>;
  }

  // 认证检查完成后渲染子组件
  return <>{children}</>;
};

export default AuthWrapper;
