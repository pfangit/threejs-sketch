# ThreeSketch

一个使用threejs渲染.sketch文件的纯前端项目

## 项目特点

- **快速开发**: 基于Vite构建，提供极快的冷启动和热更新速度
- **现代技术栈**: React 18+、TypeScript、Tailwind CSS、Ant Design
- **路由管理**: 使用React Router v7实现动态路由和权限控制
- **权限系统**: 内置基于角色的访问控制(RBAC)机制
- **代码规范**: 集成Biome进行代码格式化和ESLint进行代码检查
- **响应式设计**: 使用Tailwind CSS实现移动端友好的界面布局
- **按需加载**: 实现路由级别的代码分割和懒加载

## 技术栈

- [React](https://reactjs.org/) - 前端框架
- [Vite](https://vitejs.dev/) - 构建工具
- [TypeScript](https://www.typescriptlang.org/) - 类型检查
- [Ant Design](https://ant.design/) - UI组件库
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架
- [React Router](https://reactrouter.com/) - 路由管理
- [Alova](https://alova.js.org/) - 请求库
- [Biome](https://biomejs.dev/) - 代码格式化和检查工具

## 功能特性

### 权限管理系统
- 路由级别权限控制
- 登录状态检查
- 角色基础访问控制
- 未授权页面处理

### 路由配置
- 集中式路由配置
- 动态路由加载
- 嵌套路由支持

### UI组件
- 登录页面(账号密码/二维码)
- 基础布局(头部导航、侧边栏、底部)
- 响应式设计适配

### 开发工具
- 自动代码格式化
- 类型安全检查
- 开发服务器热更新

## 快速开始

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
```

### 代码检查和格式化

```bash
# 检查代码问题
yarn biome:check

# 格式化代码
yarn biome:format

# 代码规范检查
yarn biome:lint
```

## 项目结构

```
src/
├── components/     # 公共组件
├── config/         # 配置文件
├── layouts/        # 页面布局
├── pages/          # 页面组件
├── router/         # 路由配置
├── utils/          # 工具函数
└── assets/         # 静态资源
```

## 路由权限配置

项目支持灵活的路由权限配置，在[config/routes.ts](config/routes.ts)中定义路由时可指定auth属性：

```typescript
{
  path: "/about",
  component: "@/pages/About",
  auth: true // 需要登录才能访问
}
```

支持多种权限模式：
- `true`: 需要登录
- `false|undefined`: 公开访问
- `"role"`: 需要特定角色
- `["role1", "role2"]`: 需要任一角色

## License

MIT

这个项目模板适合用于快速搭建企业级前端应用，提供了完整的权限管理和路由系统，开发者可以根据具体需求进行定制和扩展。