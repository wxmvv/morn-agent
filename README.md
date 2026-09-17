# morn-agent

从 pi-mono 的 `packages/coding-agent` 独立提取，保留 CLI、TUI、SDK、RPC、扩展、文档和测试。

## 安装

需要 Node.js >= 22.19.0。

```bash
npm i -g @wxmvv/morn-agent
morn
```

全局安装后，用户配置、认证和会话目录为 `~/.morn/agent`，项目配置目录为 `.morn`。

## 更新

```bash
morn update                  # 更新 morn-agent 本体
morn update --force          # 重新安装 npm latest 版本
morn update --extensions     # 仅更新扩展
npm i -g @wxmvv/morn-agent@latest # 手动更新
```

启动时从 npm 检查 `@wxmvv/morn-agent` 的最新稳定版本，更新命令安装检查到的确切版本。全局安装会使用对应的包管理器；源码或本地链接安装请更新源码并重新构建。更新后重新启动 morn。

`MORN_SKIP_VERSION_CHECK=1` 只关闭自动检查，仍可手动运行 `morn update`；离线模式会禁用更新检查。

## 更新日志

在交互界面输入 `/changelog` 查看当前安装包的发布记录，最新版本在前。升级后首次启动新会话时，只展示上次已读版本到当前版本之间的变更；首次安装和恢复会话不自动展示。

发布前将 `CHANGELOG.md` 的 `Unreleased` 内容移到 `## [版本号] - YYYY-MM-DD` 下，版本号与 `package.json` 一致。`npm publish` 会把日志一并打包。上游历史单独保存在 `CHANGELOG.upstream.md`。

## 开发

需要 Node.js >= 22.19.0 和 npm。

```bash
npm ci --ignore-scripts
npm run dev -- --help
npm run dev
npm run check
npm run build
npm start
```

构建后的命令入口为 `dist/cli.js`，包的 CLI 名称为 `morn`。本地全局链接可使用 `npm link --ignore-scripts`，随后执行 `morn`。

默认用户配置、认证和会话目录为 `~/.morn/agent`，项目配置目录为 `.morn`。可通过 `MORN_CODING_AGENT_DIR` 指定用户目录。其他上游 `PI_*` 环境变量暂时保留。

## 依赖与扩展

`@earendil-works/chord`、`pi-agent-core`、`pi-ai`、`pi-client`、`pi-protocol`、`pi-tui` 和 `pi-server` 均使用 npm 发布的 `0.85.0`；间接依赖由 `package-lock.json` 锁定。无需相邻的 pi-mono checkout，也无需构建其他 workspace。

扩展可以从 `@wxmvv/morn-agent` 导入 API。上游扩展的 `@earendil-works/pi-coding-agent` 导入在扩展加载器内仍映射到本项目。SDK 使用 `@wxmvv/morn-agent`，RPC 子入口使用 `@wxmvv/morn-agent/rpc-entry`。

Node 构建采用上游已有的 unbundled 产物，运行时由 node_modules 提供依赖。可选的 `npm run build:binary` 需要 Bun。

## 离线启动设置

在 `/settings` 中切换 `Offline`，会将 `offline` 保存到用户级 `settings.json`，重启后生效。默认关闭，项目配置不覆盖此选项。开启后跳过启动联网操作（更新检查、包更新检查、安装/更新遥测等），仍可正常向模型发送请求。`--offline` 或 `MORN_OFFLINE=1` 仍可强制开启。

## 上游来源

- 版本：pi-coding-agent 0.85.0
- 提取提交：9841914c71a74d81abe07f751aefd271fd924e63
- 上游：https://github.com/earendil-works/pi
- 许可证：MIT，保留原始 LICENSE，上游日志存档为 CHANGELOG.upstream.md
- 原始使用说明：[上游 README](docs/upstream-readme.md)，其中 `pi` 命令和 `.pi` 路径在本项目对应 `morn` 和 `.morn`。

`test/helpers` 中两个 TUI 测试辅助文件来自同一提交，不属于运行时依赖。
