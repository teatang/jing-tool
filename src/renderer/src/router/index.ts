import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * 路由配置
 * 使用 hash 模式以兼容 file:// 协议访问
 */

// 创建路由实例
const router = createRouter({
  // 使用 hash 模式（#），避免服务器配置问题
  history: createWebHashHistory(),
  routes: [
    // 根路径重定向到 Base64 工具页面
    {
      path: '/',
      redirect: '/tools/string/base64'
    },
    // 字符串工具路由组
    {
      path: '/tools/string',
      children: [
        { path: 'base64', component: () => import('@renderer/views/tools/string/Base64Tool.vue') },
        { path: 'url', component: () => import('@renderer/views/tools/string/UrlTool.vue') },
        { path: 'json', component: () => import('@renderer/views/tools/string/JsonTool.vue') },
        { path: 'html', component: () => import('@renderer/views/tools/string/HtmlTool.vue') },
        { path: 'sql', component: () => import('@renderer/views/tools/string/SqlTool.vue') },
        { path: 'regex', component: () => import('@renderer/views/tools/string/RegexTool.vue') }
      ]
    },
    // 文件工具路由组
    {
      path: '/tools/file',
      children: [
        { path: 'rename', component: () => import('@renderer/views/tools/file/RenameTool.vue') },
        { path: 'search', component: () => import('@renderer/views/tools/file/SearchTool.vue') }
      ]
    },
    // 游戏
    {
      path: '/tools/game',
      children: [
        { path: 'tetris', component: () => import('@renderer/views/tools/game/TetrisGame.vue') }
      ]
    }
  ]
})

export default router
