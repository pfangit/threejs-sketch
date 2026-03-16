import type { CurrentUser } from "../src/services/auth";
import { isSuccess } from "./is-success";

export default [
  {
    url: "/api/current", // 接口路径
    method: "get", // 请求方法
    response: () => {
      const { success, code } = isSuccess();
      if (success) {
        return {
          code: code, // 自定义状态码
          message: "", // 状态信息
          success: false,
        };
      }
      // 响应函数
      const currentUser = {
        uid: "1",
        nickname: "@cname",
        avatar: "https://img95.699pic.com/photo/40250/6425.jpg_wh300.jpg",
        roles: ["admin"],
      } as CurrentUser;
      return {
        code: 0,
        message: "",
        data: currentUser,
        success: true,
      };
    },
  },
  {
    url: "/api/auth/login",
    method: "post",
    response: () => {
      // 响应函数
      const data = {
        token: "@cname",
      };
      return {
        code: 0, // 自定义状态码
        message: "", // 状态信息
        data: data, // 返回数据
        success: true,
      };
    },
  },
];
