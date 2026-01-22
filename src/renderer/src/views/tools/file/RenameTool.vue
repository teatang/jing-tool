<script setup lang="ts">
import { ref, computed } from 'vue'
import { Folder, Refresh, Edit, Check, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  editing?: boolean
  newName?: string
}

const currentPath = ref('')
const files = ref<FileEntry[]>([])
const loading = ref(false)
const selectedFiles = ref<Set<string>>(new Set())

const selectFolder = async (): Promise<void> => {
  const path = await window.api.selectFolder()
  if (path) {
    currentPath.value = path
    await loadFiles()
  }
}

const loadFiles = async (): Promise<void> => {
  if (!currentPath.value) return
  loading.value = true
  try {
    const entries = await window.api.readDir(currentPath.value)
    files.value = entries.map((e: { name: string; path: string; isDirectory: boolean }) => ({
      ...e,
      editing: false,
      newName: e.name
    }))
  } finally {
    loading.value = false
  }
}

const startEdit = (file: FileEntry): void => {
  file.editing = true
  file.newName = file.name
}

const saveEdit = async (file: FileEntry): Promise<void> => {
  if (!file.newName || file.newName === file.name) {
    file.editing = false
    return
  }

  try {
    const result = await window.api.renameFile(file.path, file.newName)
    if (result.success) {
      file.name = file.newName!
      file.editing = false
      ElMessage.success('重命名成功')
    } else {
      ElMessage.error(result.error || '重命名失败')
    }
  } catch {
    ElMessage.error('重命名失败')
  }
}

const cancelEdit = (file: FileEntry): void => {
  file.editing = false
  file.newName = file.name
}

const batchRename = async (): Promise<void> => {
  const filesToRename = files.value
    .filter((f) => f.editing && f.newName && f.newName !== f.name)
    .map((f) => ({ path: f.path, newName: f.newName! }))

  if (filesToRename.length === 0) {
    ElMessage.warning('没有需要重命名的文件')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要批量重命名 ${filesToRename.length} 个文件吗？`, '确认', {
      type: 'warning'
    })
  } catch {
    return
  }

  loading.value = true
  try {
    const results = await window.api.batchRename(filesToRename)
    const successCount = results.filter((r) => r.success).length
    const failCount = results.length - successCount

    if (successCount > 0) {
      ElMessage.success(`成功重命名 ${successCount} 个文件`)
    }
    if (failCount > 0) {
      ElMessage.error(`${failCount} 个文件重命名失败`)
    }

    await loadFiles()
  } finally {
    loading.value = false
  }
}

const toggleSelection = (path: string): void => {
  if (selectedFiles.value.has(path)) {
    selectedFiles.value.delete(path)
  } else {
    selectedFiles.value.add(path)
  }
}

const selectAll = (): void => {
  if (selectedFiles.value.size === files.value.length) {
    selectedFiles.value.clear()
  } else {
    files.value.forEach((f) => selectedFiles.value.add(f.path))
  }
}

const canRename = computed((): boolean => {
  return files.value.some((f) => f.editing && f.newName && f.newName !== f.name)
})
</script>

<template>
  <div class="tool-page">
    <div class="tool-header">
      <h2 class="tool-title">批量重命名</h2>
      <p class="tool-desc">选择文件夹并批量修改文件名</p>
    </div>

    <div class="tool-content">
      <div class="path-selector">
        <el-input v-model="currentPath" placeholder="选择文件夹路径" readonly style="flex: 1">
          <template #append>
            <el-button @click="selectFolder">
              <el-icon><Folder /></el-icon>
              选择
            </el-button>
          </template>
        </el-input>
        <el-button :disabled="!currentPath" :loading="loading" @click="loadFiles">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <div v-if="currentPath" class="file-toolbar">
        <el-checkbox
          :model-value="selectedFiles.size === files.length && files.length > 0"
          :indeterminate="selectedFiles.size > 0 && selectedFiles.size < files.length"
          @change="selectAll"
        >
          全选 ({{ selectedFiles.size }}/{{ files.length }})
        </el-checkbox>
        <el-button v-if="canRename" type="primary" @click="batchRename"> 应用所有修改 </el-button>
      </div>

      <el-table v-loading="loading" :data="files" style="width: 100%" max-height="500">
        <el-table-column width="50">
          <template #default="{ row }">
            <el-checkbox
              :model-value="selectedFiles.has(row.path)"
              @change="toggleSelection(row.path)"
            />
          </template>
        </el-table-column>
        <el-table-column label="名称" min-width="300">
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-icon v-if="row.isDirectory" class="folder-icon">
                <Folder />
              </el-icon>
              <el-icon v-else class="file-icon">
                <Document />
              </el-icon>
              <template v-if="row.editing">
                <el-input
                  v-model="row.newName"
                  size="small"
                  style="width: 200px"
                  @keyup.enter="saveEdit(row)"
                />
                <el-button
                  size="small"
                  type="success"
                  :icon="Check"
                  circle
                  @click="saveEdit(row)"
                />
                <el-button size="small" :icon="Edit" circle @click="cancelEdit(row)" />
              </template>
              <template v-else>
                <span>{{ row.name }}</span>
                <el-button size="small" :icon="Edit" circle @click="startEdit(row)" />
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="400" show-overflow-tooltip />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.path-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.file-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.folder-icon {
  color: #e6a23c;
  font-size: 18px;
}

.file-icon {
  color: #409eff;
  font-size: 18px;
}
</style>
