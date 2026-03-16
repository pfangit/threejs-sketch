export type AuthType = boolean | string | string[] | undefined;

// UmiJS风格的路由配置类型
export interface RouteConfig {
  path: string;
  absPath?: string;
  component?: string;
  layout?: string | boolean;
  redirect?: string;
  auth?: AuthType;
  exact?: boolean;
  hideInMenu?: boolean;
  children?: RouteConfig[];
  // 约定式路由相关
  index?: boolean;
  id?: string;
}

const routes: RouteConfig[] = [
  {
    path: "/",
    layout: "@/layouts/basic-layout",
    children: [
      {
        path: "/",
        component: "./home",
        index: true,
      },
      {
        path: "/about",
        component: "./about",
      },
    ],
  },
  {
    path: "/auth",
    component: "./auth/login",
    layout: false,
  },
];

export default routes;
