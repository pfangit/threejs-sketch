import type { MenuDataItem } from "@ant-design/pro-components";
import { fecth } from "@/request.tsx";

export type CurrentUser = {
  uid: string;
  nickname: string;
  avatar: string;
  roles: string[];
};

export const fetchCurrentUser = () => {
  return fecth<CurrentUser>("/api/current", {});
};

export const fetchMenus = () => {
  return fecth<MenuDataItem[]>("/api/menus", {});
};
