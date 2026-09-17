# Changelog

记录 morn-agent 自身的版本变更。尚未发布的修改放在 Unreleased，发布前移入对应版本。
上游历史见 [CHANGELOG.upstream.md](CHANGELOG.upstream.md)。

## [Unreleased]

### Changed

- 将环境变量 PI_SKIP_VERSION_CHECK 和 PI_OFFLINE 更名为 MORN_SKIP_VERSION_CHECK 和 MORN_OFFLINE，启动配置和脚本需使用新名称。

### Fixed

- 更新检查改为查询 npm 的 morn-agent，并固定更新包名、校验版本号，避免更新到上游 pi 包。
- 修正二进制安装的更新提示，避免指向上游下载地址。
- 更新日志使用 morn-agent 自身的版本历史，启动时只展示已安装版本范围内的新记录。

## [0.1.0]

### Added

- 首次独立发布 morn-agent，提供 morn 命令，以及 CLI、TUI、SDK、RPC 和扩展支持。
- 使用 ~/.morn/agent 用户目录和 .morn 项目配置目录。
- 基于 pi-coding-agent 0.85.0，依赖 npm 发布的上游组件。
