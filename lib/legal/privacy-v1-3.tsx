import { PrivacyPolicyV1_1 } from "@/lib/legal/privacy-v1-1";
import { privacyPolicyV1_2Sections } from "@/lib/legal/privacy-v1-2";

const foregroundRadarSection = {
  index: "07",
  title: "附近雷达、近似位置与系统权限",
  body: [
    "“附近雷达”是由你主动进入的可选功能。每次进入附近雷达时，应用都会单独说明展示目的、可见对象和模糊化方式，并由你确认本次展示。FitMeet 不提供自动签到、后台签到、永久开启，也不会恢复上一次展示状态。",
    "你可以拒绝定位或选择暂不进入；这只会关闭附近雷达及依赖附近距离的推荐，不影响登录、资料、Agent、非附近匹配、消息等其他功能。定位权限可以随时在设备系统设置中撤回。",
    "确认后，应用仅在当前附近雷达页面处于前台时读取本次位置，将其转换为约 3 公里的模糊范围，并显示附近用户。离开雷达页面、切换标签、打开候选详情、App 进入后台或退出登录时，本次展示和附近结果会立即停止并清空；再次进入需要重新确认，不会自动重试或重新签到。",
    "只有同样手动进入附近雷达、并通过账号状态、安全规则和双方拉黑过滤的用户，才能看到你的头像、公开资料和模糊距离。其他用户不会看到你的精确经纬度、实时定位点、移动轨迹、家庭地址或工作地址；服务端也不会向其返回设备采集到的精确坐标。",
    "当前雷达页面处于前台时，应用会使用随机生成且仅保存在内存中的本次会话标识维持展示。服务端只处理完成本次附近筛选所需的会话标识、模糊区域、签到与停止状态，并使用短时故障保护租约处理断网、闪退或强制退出。该租约不是面向用户的展示时长，不用于后台继续展示；心跳失败、会话过期或被另一设备的新会话替换时，当前页面会立即停止展示。",
    "“允许资料推荐”仅控制你的公开资料是否可进入一般推荐，不会开启位置读取或附近展示，也不能替代每次进入附近雷达时的单独确认。",
    "麦克风和语音识别仅在你主动开始语音输入时启用，用于把需求转成文字；停止录音后应用会结束录音会话，不在后台持续监听。语音识别可能调用 Apple 系统语音服务，具体处理受设备设置和 Apple 政策约束。相册、通知、麦克风、语音识别和定位权限会在对应功能需要时动态请求；拒绝某一权限只影响依赖该权限的功能。",
  ],
};

export const privacyPolicyV1_3Sections = privacyPolicyV1_2Sections.map((section) =>
  section.index === foregroundRadarSection.index ? foregroundRadarSection : section,
);

export function PrivacyPolicyV1_3({ snapshot = false }: { snapshot?: boolean }) {
  return (
    <PrivacyPolicyV1_1
      snapshot={snapshot}
      sectionsOverride={privacyPolicyV1_3Sections}
      versionOverride="1.3"
      effectiveDateOverride="2026-08-25"
      updatedAtOverride="2026-08-25"
      statusOverride={snapshot ? "版本 1.3 历史快照" : "现行有效"}
    />
  );
}
