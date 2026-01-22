# GitHub Actions Release 配置说明

## 概述

`.github/workflows/release.yml` 配置了自动构建和发布流程：
- 每次推送到 `main` 分支时自动构建
- 打标签（`v*`）时自动发布 Release
- 支持 macOS、Windows、Linux 三平台

## 需要的 Secrets

在 GitHub 仓库 `Settings → Secrets and variables → Actions` 中添加以下 secrets：

### 可选配置（无签名）

如果不需要代码签名，可以直接使用 ad-hoc 签名（仅供测试）：

| Secret Name | Value | Required |
|-------------|-------|----------|
| (无) | - | 否 |

### macOS 签名（正式发布需要）

| Secret Name | Description |
|-------------|-------------|
| `APPLE_ID` | Apple ID 邮箱 |
| `APPLE_APP_SPECIFIC_PASSWORD` | 应用专用密码（appleid.apple.com 生成） |
| `CSC_LINK` | 开发者证书（.p12 文件 base64 编码） |
| `CSC_KEY_PASSWORD` | 证书密码 |

### Windows 签名

| Secret Name | Description |
|-------------|-------------|
| `WIN_CSC_LINK` | Windows 代码签名证书（.p12 或 .pfx base64 编码） |
| `WIN_CSC_KEY_PASSWORD` | 证书密码 |

## 生成证书 base64 编码

```bash
# macOS/Windows 证书
base64 -i certificate.p12 -o certificate.txt

# 然后将 certificate.txt 的内容作为 CSC_LINK 或 WIN_CSC_LINK 的值
```

## 本地测试

推送代码到 main 分支后，GitHub Actions 会自动运行构建。

## 版本号规则

GitHub Release 版本号从 git tags 自动获取：

```bash
git tag v1.0.0
git push origin v1.0.0
```

这会触发正式 Release。
