import { PrivacyPolicyV1, privacyPolicyV1Sections } from "@/lib/legal/privacy-v1";

const nearbyRadarSection = {
  index: "07",
  title: "附近雷达、近似位置与系统权限",
  body: [
    "“附近雷达”是由你主动开启的可选功能。每次希望出现在附近推荐中时，你都必须在功能页面手动签到并确认当次展示；FitMeet 不提供自动签到、后台续期或永久开启。单次签到有效期为 4 小时，到期后自动失效，再次使用需要重新手动签到并确认。",
    "签到前，应用会单独说明展示目的、可见对象、模糊化方式和有效期，并请求你的明确同意。你可以拒绝定位或拒绝签到；这只会关闭附近雷达及依赖附近距离的推荐，不影响登录、资料、Agent、非附近匹配、消息等无关功能。",
    "签到有效期内，你可以随时在附近雷达或隐私设置中选择“停止展示”，停止后不再作为附近候选出现。关闭系统定位权限也会阻止新的签到；已经停止或到期的签到不会自动恢复。",
    "我们仅向同样处于有效手动签到状态、且通过账号状态、安全规则和双方拉黑过滤的附近用户展示模糊距离或城市、区域信息。其他用户不会看到你的精确经纬度、实时定位点、移动轨迹、家庭或工作地址；应用也不会在后台持续更新你的展示位置。",
    "当你主动签到并授权定位时，应用读取设备当时的位置，并在用于附近筛选前转换为产品明确展示的模糊范围。服务端只处理完成当次附近筛选所需的模糊位置、签到时间、失效时间和停止状态；不向其他用户返回设备采集到的精确坐标。",
    "麦克风和语音识别仅在你主动开始语音输入时启用，用于把需求转成文字；停止录音后应用会结束录音会话，不在后台持续监听。语音识别可能调用 Apple 系统语音服务，具体处理受设备设置和 Apple 政策约束。",
    "相册、通知、麦克风、语音识别和定位权限会在对应功能需要时动态请求。拒绝某一权限只影响依赖该权限的功能，并可通过设备系统设置撤回。",
  ],
};

export const privacyPolicyV1_1Sections = privacyPolicyV1Sections.map((section) =>
  section.index === nearbyRadarSection.index ? nearbyRadarSection : section,
);

export function PrivacyPolicyV1_1({
  snapshot = false,
  sectionsOverride = privacyPolicyV1_1Sections,
  versionOverride = "1.1",
  effectiveDateOverride = "2026-08-12",
  updatedAtOverride = "2026-08-12",
  statusOverride,
}: {
  snapshot?: boolean;
  sectionsOverride?: typeof privacyPolicyV1Sections;
  versionOverride?: string;
  effectiveDateOverride?: string;
  updatedAtOverride?: string;
  statusOverride?: string;
}) {
  return (
    <PrivacyPolicyV1
      snapshot={snapshot}
      sectionsOverride={sectionsOverride}
      versionOverride={versionOverride}
      effectiveDateOverride={effectiveDateOverride}
      updatedAtOverride={updatedAtOverride}
      statusOverride={statusOverride ?? (snapshot ? "版本 1.1 历史快照" : "现行有效")}
    />
  );
}
