# CLCS Lab Website

计算语言学与意识科学实验室的中英文静态网站，基于 [Astro](https://astro.build/) 构建并部署到 GitHub Pages。根路径 `/` 会跳转到默认中文页面 `/zh/`。

## 本地运行

需要 Node.js 22 及 npm。

```bash
npm install
npm run dev
```

打开终端显示的本地地址。其他常用命令：

```bash
npm run check     # 类型与 Astro 检查
npm run build     # 检查并生成静态网站到 dist/
npm run verify    # 验证生成页面、站内链接和资源
npm run preview   # 本地预览 dist/
```

建议在发布前执行：

```bash
npm run build && npm run verify
```

如果批量修改内容后开发页面没有更新，可以停止服务器并清除 Astro 缓存：

```bash
rm -rf .astro
npm run dev
```

## 内容维护

日常内容位于 `src/content/`：

```text
src/content/
├── member/         # 按 pi、phd、master 等目录组织成员
├── news/           # 每条消息使用 meta.yaml + zh.md / en.md
├── projects/       # 项目信息及可选的双语文章
├── publications/   # 每篇论文一个 YAML
└── research/       # 双语研究方向 YAML
```

固定信息与功能开关位于 `src/data/site.ts`，静态图片、Logo 和 PDF 位于 `public/`。

### 课程材料

课程页面位于 `src/pages/[lang]/course/`，CSE5026 的周次、主题与资源链接按学期维护在 `src/content/courses/cse5026/<year>.yaml`（纯数据文件，由内容集合 schema 校验）。可下载的讲义、阅读材料和实验包放在：

```text
public/course/cse5026/<year>/
├── slides/
├── readings/
└── labs/
```

新增或替换资源后，同步更新对应学期 YAML 中的路径，再运行 `npm run build && npm run verify` 检查页面和站内链接。新开一个学期时，复制上一份 YAML 并修改 `year` 字段即可。

### 本地管理面板（推荐）

```bash
npm run admin
```

启动一个仅监听本机回环地址（127.0.0.1:4210）的管理面板并自动打开浏览器，无需接触 git 与文件目录即可完成日常维护：

- **编辑学期内容**：按学期分页，直接修改每周的双语主题、日期、备注，新增或删除周次；修改后点击底部"保存"写回对应 YAML（写入前自动在 `admin/.backups/` 保留最近 20 份备份）。
- **上传课程文件**：在每周卡片上点击"上传讲义 / 上传阅读 / 上传实验"或直接拖拽文件，文件自动写入 `public/course/cse5026/<year>/<slides|readings|labs>/` 并挂载到该周；同名文件需确认覆盖。阅读材料库（readingPool）同样支持上传与移除。
- **一键发布**：点击"发布"，面板会将 `src/content/courses/` 与 `public/course/` 的更改提交并推送到远端（仅这两个目录，不影响仓库其他改动）。

保存 YAML 后建议运行 `npm run build && npm run verify` 做一次完整检查；面板的校验是轻量的，权威校验由构建时的内容集合 schema 完成。

课程讲义和实验下载链接支持悬停或键盘聚焦查看最后修改时间，统一显示北京时间（UTC+8）。时间来源按优先级：管理面板上传时记录在学期 YAML `updatedAt` 字段中的上传时刻（最准确，推荐）；无记录时回退到该文件最近一次 Git 提交的时间，避免重新部署改变日期；本地未提交的新文件或修改文件使用文件系统修改时间。部署工作流须保留完整 Git 历史（`fetch-depth: 0`）。

## GitHub Actions 构建与部署

工作流位于 `.github/workflows/deploy.yml`，会在以下情况运行：

- 推送到 `main` 分支；
- 在 GitHub 的 **Actions → Deploy to GitHub Pages → Run workflow** 手动触发。

工作流使用 Node.js 22，依次执行：

```bash
npm ci
npm run build
npm run verify
```

验证通过后，`dist/` 会自动部署到 GitHub Pages。首次部署时需要在仓库 **Settings → Pages → Build and deployment** 中将 Source 设置为 **GitHub Actions**。

`astro.config.mjs` 会自动识别用户主页仓库与普通项目仓库的部署路径。如需覆盖，可在 Actions 环境中设置：

- `SITE_URL`：完整站点地址；
- `BASE_PATH`：部署子路径，例如 `/` 或 `/lab-site/`。

当前 `dev` 分支不会自动部署；合并或推送到 `main` 后才会触发正式部署。
