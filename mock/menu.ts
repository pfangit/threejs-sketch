export default [
  {
    url: "/api/menus", // 接口路径
    method: "get", // 请求方法
    response: () => {
      return {
        code: 0,
        message: "",
        data: [
          {
            path: "/",
            name: "欢迎",
            children: [
              {
                path: "/welcome",
                name: "one",
                children: [
                  {
                    path: "/welcome/welcome",
                    name: "two",
                    exact: true,
                  },
                ],
              },
            ],
          },
          {
            path: "/about",
            name: "关于",
          },
          {
            path: "/admin",
            name: "管理",
            children: [
              {
                path: "/admin/user",
                name: "用户管理",
                exact: true,
              },
            ],
          },
          {
            path: "/auth",
            name: "登录",
          },
        ],
        success: true,
      };
    },
  },
];
