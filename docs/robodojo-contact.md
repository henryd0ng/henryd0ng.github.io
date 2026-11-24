# robodojo-contact

这个双语目录展示 RoboDojo 接触操作项目中的场景、工具资产和仿真录像。公开入口是 [robodojo-contact](https://henryd0ng.github.io/robodojo-contact/)。

## 更新任务

在 `src/data/robodojo-contact-catalog.json` 中维护任务、双语文字、分类和批次。字段类型定义在 `src/data/robodojo-contact.ts`。沿用已有任务 ID，这样已分享的 `#task=...` 地址可以继续使用。站点只依赖仓库内已发布的目录和媒体，构建时无需安装 RoboDojo 或模拟器。

核对 RoboDojo 工作树中的任务清单、已保存场景和运行报告。工具资产可从 `docs/user/tasks/tool_asset_check.md` 查找，静态场景在 `src/teleop/preview_catalog.json`，交互任务在 `docs/user/teleoperation/simready_tasks.md`。完整动作的证据见相应录像和复核报告。将依据以仓库相对路径写入条目的 `sourcePaths`，在 `statusNote` 中写清本场景已经完成的部分。

- **演示已完成**表示一次完整的仿真操作已有可复核的运行记录和对应录像。内部状态 ID `accepted` 用于兼容已有筛选链接。目录没有公布基准成功率。
- **开发中**用于正在实现或已有局部验证的交互。工具机构量测、夹爪接触以及启动录像可作为进展依据。
- **未开始**用于以初始布局或候选资产为主的任务。只有候选模型的条目可说明接入进度，待场景注册后再补图。

## 替换图片和视频

媒体放在 `public/robodojo-contact/tasks/`。用 `media.image` 指向任务初态或录像封面，用可选的 `media.detail` 指向物体近景。每个已完成条目的 `media.videos` 至少有一段对应的完整录像，其他状态只显示静态图片。项目首页的主视角可使用同一次演示的单独机位。

原生截图、录像及其他初始布局渲染的来源分别记录在素材目录中的 `native-captures-provenance.json`、`video-provenance.json` 和 `layout-renders-provenance.json`。静态布局渲染按保存的位姿和实际 USD 网格构图，使用中性桌面便于观察物体。更新素材时同步维护其来源记录。

## 检查与下载

运行 `npm ci` 和 `npm run build`。构建会检查双语核心字段、唯一 ID、状态和批次引用、媒体路径，以及完成状态与录像是否对应。通过 `npm run dev` 可在浏览器里预览中英文界面。

`/robodojo-contact/downloads/` 下提供任务目录 `tasks.json`、双语指南 `guide.md`、网站元数据检查报告 `validation.json` 和图集 `assets.zip`。图集包含任务目录、来源记录、初态图及近景图；录像通过各任务的媒体地址播放。

部分场景使用 NVIDIA 的 SimReady 模型，经 RoboDojo 适配、布局和渲染。模型的来源版本和许可见 [SimReady Assets](https://huggingface.co/datasets/nvidia/simready-assets/tree/7879e0e50423290300ac20ecd6e727325f680b60) 与 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)。
