import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/tools/string/base64'
    },
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
    {
      path: '/tools/file',
      children: [
        { path: 'rename', component: () => import('@renderer/views/tools/file/RenameTool.vue') },
        { path: 'search', component: () => import('@renderer/views/tools/file/SearchTool.vue') }
      ]
    }
  ]
})

export default router
