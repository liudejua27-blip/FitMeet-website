# FitMeet 三端 API 合同与验收矩阵

此文件以 iOS 的 `FitMeetCoreEndpoint.swift` 为路径唯一基线，以 `MobileAPI` 的 JSON 路由为可运行服务端基线。Web 不定义独立接口；微信和 iOS 均应使用下表中的同一路径、认证头、幂等要求与状态语义。

| 能力 | 核心合同 | iOS 基线 | Web | 微信 |
| --- | --- | --- | --- | --- |
| 认证与会话 | `/auth/sms/*`、`/auth/wechat/login`、`/auth/refresh` | `RootView` 认证与手机绑定门控 | `FitMeetApiClient` + 体验会话适配 | `services/http-client.ts` refresh 流程 |
| 初始目的 | 本地选择；真人连接才进入建档，生活需求直接交给 Agent | `InitialPurposeView.swift` + `DemandType` | 十种 iOS 同名需求（交友、恋爱、约练、搭子、旅伴、服务、找房、活动、求助、其他） | `initial-purpose` 页面 |
| 九步建档 | `POST /users/me/onboarding/complete`，含同意项、照片、距离和边界 | `OnboardingDraftModels.swift` | 九步流 + 体验账号提交 | `onboarding` 页面 |
| 资料与隐私 | `/users/profile`、`/users/me/social-profile*` | `ProfileView.swift` | 编辑资料、兴趣、照片、隐私开关 | `profile`、`profile-settings` |
| 动态与发现 | `/feed/posts`、`/public/social-intents`、`/public/task-intents` | `MomentsView.swift` | 发布、点赞、评论、发现分栏 | `discover` 页面 |
| Agent 与需求 | `/demands*`、`/users/me/demand-draft-sessions*`、`/users/me/agent-memory*` | `AgentHomeViewModel.swift` | 高情商澄清、草稿、发布/暂停/取消、候选人收藏/跳过/邀请、可删除记忆 | 已有 `experience-service` 与 `my-demands`；当前路演构建未暴露 Agent Tab，发布前需恢复该入口 |
| 私信 | `/messages/start`、`/messages/conversations*` | `MessagesView.swift` | 会话列表、线程、发送消息 | `messages`、`conversation` |
| 关系 | `/connections/requests*`、`/relationships/users/:id`、`/friends/:id` | `MessagesInboxModels.swift` | 好友申请、接受/拒绝与关系状态 | `profile-friends` |
| 活动邀请与约练 | `/meet-invitations*`、`/meets/:id/{confirm,cancel,complete,no-show,reviews}` | `MeetLifecycleViews.swift` | 创建、接受、拒绝、撤回、到达、完成、爽约、评价 | 消息/发现联动 |
| 设置与安全 | `/social-agent/reminders/preferences`、`/safety/*`、账号导出/删除 | `ProfileSettingsSheets.swift` | 隐私、通知、举报、拉黑、退出体验 | `profile-settings` |

Agent 的正式闲聊运行时通过同一认证会话访问 `/agent/v1` 代理；iOS 的 `social_chat_v1` 与 `social_task_v1` 明确要求：在用户确认前，Agent 不得声称已经发布需求、搜索候选、发送邀请、修改画像、拉黑或举报。路演体验账号使用本地受控回复演示这一边界，不能替代正式模型调用。

## Web 路演闭环（本次补齐）

Web 的 `/agent/try` 将正式接口的状态机保留在体验账号中，便于投资人从手机完整走通；只有配置了 `NEXT_PUBLIC_FITMEET_API_MODE=live` 与有效会话时，才会调用下列正式写接口。

| 阶段 | 体验账号行为 | 正式同源合同 |
| --- | --- | --- |
| 理解 | 小福先复述意图、压力与边界，只追问缺失的时间/地点；明确不自动私信、申请或邀请 | `/agent/v1`，`/users/me/agent-memory*` |
| 需求 | 编辑草稿 → 确认发布 → 匹配 → 暂停/取消 | `POST /demands`，`/demands/:id/publish|hide|cancel` |
| 候选 | 查看理由 → 收藏/不合适/生成邀请草稿；不合适不通知对方 | `/demands/:id/candidates`，`/demands/:id/candidates/:candidateId/behavior` |
| 关系与邀请 | 先申请好友或确认发送邀请；接受前连续私信保持锁定 | `/connections/requests*`，`/meet-invitations*` |
| 会面 | 接受 → 约练排期 → 确认到达 → 完成/爽约/取消 → 可选评价 | `/meets/:id/confirm|complete|no-show|cancel|reviews` |
| 大厅 | 社交/任务申请可提交、撤回、被接受或婉拒；接受前不开放连续私信 | `/public/*-intents/:id/applications` 与 application 状态接口 |
| 安全 | 解除好友、拉黑、报告安全帮助都明确停止推荐/会话权限 | `/friends/:id`，`/safety/reports`，`/safety/blocks/:id` |

## 统一验收规则

1. 所有变更操作携带 `Authorization: Bearer <token>`；创建、发送、接受、拒绝、取消等可重试写操作携带 `Idempotency-Key`。
2. 非鉴权体验账号可以使用本地 DemoTransport，但其调用意图、字段名称、状态机与上表的正式合同相同；不得产生 Web 专有状态。
3. 关系未建立、申请未接受、邀请未接受时，不得提前开放私信。精确位置不在任一端展示。
4. 三端验收以状态和副作用为准：同一账号在一端写入资料、动态、邀请、关系或会话后，其他端刷新必须读取同一资源状态。
5. 正式发布前应在同一测试账号上逐项运行：建档提交、资料更新、动态发布/点赞、需求发布、候选邀请、邀请接受、好友关系、消息往返、隐私开关及安全操作。

## 当前三端验收结论

- iOS 是五 Tab 的功能和视觉基线；Web 已按“首页、发现、小福、消息、我的”顺序实现入口，并补齐初始目的分流、九步建档、高情商澄清与上述可回退闭环。
- 微信构建现为五 Tab，并新增独立“小福”Tab。它复用现有 `/agent/v1/chat/completions` 与 Agent memory 合同；`npm run check` 已验证页面、Tab 顺序和本地编译产物。微信开发者工具的真机视觉验收仍应在发布前补跑。
- 本次 Web 体验账号不写入真实数据；启用正式 API 模式后，仍须使用同一个测试账号完成上面的跨端状态回读验收。体验演示不把“对方接受”“爽约”等模拟按钮伪装成真实用户行为。
