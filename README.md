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
- **Mermaid 编辑器** - 编辑 Mermaid 语法并实时预览效果

### 文件工具

- **批量重命名** - 自定义规则批量重命名文件
- **文件搜索** - 按文件名搜索文件并可选择删除

### 游戏娱乐

- **俄罗斯方块** - 经典俄罗斯方块游戏，支持：
  - 7 种经典方块形状（I、O、T、S、Z、J、L）
  - 不同方块不同颜色
  - 下一个方块预览
  - 幽灵方块显示落点
  - 等级系统和分数计算
  - 暂停/继续功能
  - 深色/浅色模式自适应

### 主题支持

- 浅色模式
- 深色模式
- 跟随系统

## 技术栈

- **Electron** - 桌面应用框架
- **Vue 3** - 前端框架（Composition API + Pinia 状态管理）
- **TypeScript** - 类型安全
- **Element Plus** - UI 组件库
- **TailwindCSS** - 实用优先的 CSS 框架（v3.4）
- **PostCSS** - CSS 转换工具（配合 autoprefixer）
- **electron-vite** - 构建工具
- **Vitest** - 单元测试
- **Pinia** - 状态管理
- **Mermaid** - 图表渲染库

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
│   ├── composables/         # Vue 组合式函数
│   ├── router/              # Vue Router 路由配置
│   ├── stores/              # Pinia 状态管理
│   │   └── theme.ts         # 主题状态存储
│   ├── assets/              # 静态资源
│   │   └── main.css         # TailwindCSS 入口和自定义工具类
│   ├── views/               # 页面组件
│   │   ├── tools/
│   │   │   ├── string/      # 字符串工具
│   │   │   │   ├── Base64Tool.vue
│   │   │   │   ├── UrlTool.vue
│   │   │   │   ├── JsonTool.vue
│   │   │   │   ├── HtmlTool.vue
│   │   │   │   ├── SqlTool.vue
│   │   │   │   ├── RegexTool.vue
│   │   │   │   └── MermaidTool.vue
│   │   │   └── file/        # 文件工具
│   │   │       ├── RenameTool.vue
│   │   │       └── SearchTool.vue
│   │   │   └── game/        # 游戏娱乐
│   │   │       └── TetrisGame.vue
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
- `/tools/string/mermaid` → Mermaid 编辑器
- `/tools/file/rename` → 批量重命名
- `/tools/file/search` → 文件搜索
- `/tools/game/tetris` → 俄罗斯方块

## CSS 样式规范

项目使用 TailwindCSS 作为 CSS 框架，采用实用优先的样式编写方式。

### 配置文件

- `tailwind.config.js` - TailwindCSS 配置（内容扫描路径、自定义颜色等）
- `postcss.config.js` - PostCSS 配置（tailwindcss + autoprefixer）
- `src/renderer/src/assets/main.css` - TailwindCSS 入口文件和自定义工具类

### 自定义工具类

在 `main.css` 中定义了项目通用的工具类：

```css
.tool-page      /* 页面容器：全高、flex 列布局 */
.tool-header    /* 页面头部：底部间距 */
.tool-title     /* 标题样式：2xl 字号、半粗体 */
.tool-desc      /* 描述文本：灰色文字 */
.tool-content   /* 内容区域：flex-1、flex 列布局、gap-4 */
.tool-actions   /* 操作栏：flex 换行、gap-3 */
.textarea-container  /* 文本域容器：flex-1、flex 列 */
.textarea-label      /* 文本域标签：14px 字号、中等字重 */
.editor-textarea     /* 编辑器文本域：flex-1、resize-none、等宽字体 */
```

### 使用方式

```vue
<!-- 模板中使用 TailwindCSS 实用类 -->
<div class="flex items-center gap-4 p-4 bg-white dark:bg-gray-800">
  <span class="text-sm font-medium text-gray-700 dark:text-gray-200">标题</span>
</div>

<!-- 自定义组件样式使用 @apply -->
<style scoped>
.custom-component {
  @apply flex flex-col gap-2 p-4 border border-gray-200 dark:border-gray-700;
}
</style>
```

### 自定义颜色

在 `tailwind.config.js` 中定义了俄罗斯方块方块颜色：

```js
colors: {
  tetris: {
    I: '#00f0f0',  // 青色
    O: '#f0f000',  // 黄色
    T: '#a000f0',  // 紫色
    S: '#00f000',  // 绿色
    Z: '#f00000',  // 红色
    J: '#0000f0',  // 蓝色
    L: '#f0a000'   // 橙色
  }
}
```

### 深色模式

使用 `dark:` 前缀支持深色模式：

```vue
<div class="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200">
  内容
</div>
```

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
