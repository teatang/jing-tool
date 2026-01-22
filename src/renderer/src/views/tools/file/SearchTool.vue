<script setup lang="ts">
import { ref } from 'vue'
import { Folder, Search, Delete, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface SearchResult {
  name: string
  path: string
  selected: boolean
}

const searchPath = ref('')
const keyword = ref('')
const results = ref<SearchResult[]>([])
const loading = ref(false)
const searching = ref(false)

const selectFolder = async (): Promise<void> => {
  const path = await window.api.selectFolder()
  if (path) {
    searchPath.value = path
  }
}

const searchFiles = async (): Promise<void> => {
  if (!searchPath.value) {
    ElMessage.warning('请先选择搜索文件夹')
    return
  }
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  searching.value = true
  loading.value = true
  results.value = []

  try {
    const files = await window.api.searchFiles(searchPath.value, keyword.value)
    results.value = files.map((f) => ({
      ...f,
      selected: false
    }))
  } finally {
    loading.value = false
    searching.value = false
  }
}

const toggleSelect = (result: SearchResult): void => {
  result.selected = !result.selected
}

const selectAll = (): void => {
  const allSelected = results.value.every((r) => r.selected)
  results.value.forEach((r) => (r.selected = !allSelected))
}

const hasSelected = (): boolean => {
  return results.value.some((r) => r.selected)
}

const selectedCount = (): number => {
  return results.value.filter((r) => r.selected).length
}

const deleteSelected = async (): Promise<void> => {
  const toDelete = results.value.filter((r) => r.selected)

  if (toDelete.length === 0) {
    ElMessage.warning('请先选择要删除的文件')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${toDelete.length} 个文件/文件夹吗？此操作不可恢复！`,
      '危险操作',
      { type: 'error' }
    )
  } catch {
    return
  }

  loading.value = true
  try {
    const paths = toDelete.map((r) => r.path)
    const resultsDelete = await window.api.deleteFiles(paths)
    const successCount = resultsDelete.filter((r) => r.success).length

    if (successCount > 0) {
      ElMessage.success(`成功删除 ${successCount} 个文件`)
      // 移除已删除的文件
      results.value = results.value.filter(
        (r) => !r.selected || !resultsDelete.find((d) => d.path === r.path && d.success)
      )
    }

    const failCount = resultsDelete.length - successCount
    if (failCount > 0) {
      ElMessage.error(`${failCount} 个文件删除失败`)
    }
  } finally {
    loading.value = false
  }
}

const clearSearch = (): void => {
  results.value = []
  keyword.value = ''
}
</script>

<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">文件搜索</h2>
      <p class="tool-desc">根据文件名搜索文件并可选择删除</p>
    </div>

    <div class="tool-content">
      <div class="search-config">
        <el-input v-model="searchPath" placeholder="选择搜索文件夹" readonly style="flex: 1">
          <template #append>
            <el-button @click="selectFolder">
              <el-icon><Folder /></el-icon>
              选择
            </el-button>
          </template>
        </el-input>
        <el-input
          v-model="keyword"
          placeholder="输入文件名关键词"
          style="width: 300px"
          @keyup.enter="searchFiles"
        />
        <el-button type="primary" :loading="searching" @click="searchFiles">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="clearSearch">清空</el-button>
      </div>

      <div v-if="results.length > 0" class="result-toolbar">
        <el-checkbox
          :model-value="results.length > 0 && results.every((r) => r.selected)"
          :indeterminate="results.some((r) => r.selected) && !results.every((r) => r.selected)"
          @change="selectAll"
        >
          全选 ({{ selectedCount() }}/{{ results.length }})
        </el-checkbox>
        <el-button type="danger" :disabled="!hasSelected()" @click="deleteSelected">
          <el-icon><Delete /></el-icon>
          删除选中 ({{ selectedCount() }})
        </el-button>
      </div>

      <el-table v-loading="loading" :data="results" style="width: 100%" max-height="500">
        <el-table-column width="50">
          <template #default="{ row }">
            <el-checkbox :model-value="row.selected" @change="toggleSelect(row)" />
          </template>
        </el-table-column>
        <el-table-column label="文件名" min-width="250">
          <template #default="{ row }">
            <div class="file-cell">
              <el-icon class="file-icon"><Document /></el-icon>
              {{ row.name }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="完整路径" min-width="500" show-overflow-tooltip />
      </el-table>

      <el-empty v-if="results.length === 0 && !loading && !searching" description="暂无搜索结果" />
    </div>
  </div>
</template>

<style scoped>
.search-config {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.result-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #409eff;
  font-size: 18px;
}
</style>
