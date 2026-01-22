# jing-tool

一款基于 Electron、Vue 3 和 TypeScript 构建的跨平台桌面工具集合应用。

## 功能特性

### 字符串工具

- **Base64 编解码** - 支持 Unicode 字符的 Base64 编码和解码
- **URL 编解码** - URL 安全编码和解码
- **JSON 格式化** - JSON 格式化或压缩为单行
- **HTML 格式化** - HTML 带缩进格式化或压缩
- **SQL 格式化** - SQL 代码格式化，支持关键字高亮和适当缩进
- **正则测试** - 实时匹配测试正则表达式

### 文件工具

- **批量重命名** - 自定义规则批量重命名文件
- **文件搜索** - 按文件名搜索文件并可选择删除

### 主题支持

- 浅色模式
- 深色模式
- 跟随系统

## 技术栈

- **Electron** - 桌面应用框架
- **Vue 3** - 前端框架（Composition API）
- **TypeScript** - 类型安全
- **Element Plus** - UI 组件库
- **electron-vite** - 构建工具
- **Vitest** - 单元测试

## 项目初始化

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 测试

```bash
pnpm test          # 监听模式，开发时使用
pnpm test:run      # 运行一次并退出（CI 环境）
pnpm test:ui       # 浏览器 UI 界面运行测试
pnpm test:main.    # 测试主进程代码
```

### 代码检查

```bash
pnpm lint          # 运行 ESLint
pnpm format        # 使用 Prettier 格式化
```

### 类型检查

```bash
pnpm typecheck     # 检查主进程和渲染进程的类型
```

### 构建打包

```bash
pnpm build              # 构建生产版本（包含类型检查）
pnpm build:win          # 构建 Windows 安装包
pnpm build:mac          # 构建 macOS DMG 安装包
pnpm build:linux        # 构建 Linux AppImage
```

## 推荐 IDE 配置

- [VSCode](https://code.visualstudio.com/)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## 项目结构

```
src/
├── main/                    # Electron 主进程
│   └── index.ts             # BrowserWindow、生命周期、IPC 处理器
├── preload/                 # 预加载脚本
│   └── index.ts             # contextBridge API 暴露（文件操作相关）
├── renderer/src/            # Vue 3 前端
│   ├── App.vue              # 主应用布局
│   ├── components/          # 公共组件
│   ├── composables/         # Vue 组合式函数（useTheme 等）
│   ├── router/              # Vue Router 路由配置
│   ├── views/               # 页面组件
│   │   ├── tools/
│   │   │   ├── string/      # 字符串工具
│   │   │   │   ├── Base64Tool.vue
│   │   │   │   ├── UrlTool.vue
│   │   │   │   ├── JsonTool.vue
│   │   │   │   ├── HtmlTool.vue
│   │   │   │   ├── SqlTool.vue
│   │   │   │   └── RegexTool.vue
│   │   │   └── file/        # 文件工具
│   │   │       ├── RenameTool.vue
│   │   │       └── SearchTool.vue
│   │   └── HomeView.vue     # 首页
│   └── main.ts              # Vue 应用初始化
├── resources/               # 资源文件（图标等）
└── build/                   # 构建配置和图标文件
    └── entitlements.mac.plist
```

## 路由配置

- `/` → 重定向到 `/tools/string/base64`
- `/tools/string/base64` → Base64 编解码
- `/tools/string/url` → URL 编解码
- `/tools/string/json` → JSON 格式化
- `/tools/string/html` → HTML 格式化
- `/tools/string/sql` → SQL 格式化
- `/tools/string/regex` → 正则测试
- `/tools/file/rename` → 批量重命名
- `/tools/file/search` → 文件搜索

## IPC 通信

渲染进程通过 `contextBridge` 暴露的 API 与主进程通信：

```typescript
// 渲染进程调用文件操作 API
window.api.selectFolder()           // 选择文件夹
window.api.readDir(path)            // 读取目录内容
window.api.renameFile(old, newPath) // 重命名文件
window.api.batchRename(files)       // 批量重命名
window.api.searchFiles(dir, keyword) // 搜索文件
window.api.deleteFiles(paths)       // 删除文件

// 主进程处理（ipcMain）
ipcMain.handle('select-folder', () => { ... })
ipcMain.handle('read-dir', (event, path) => { ... })
// ...
```

## 开源协议

MIT
