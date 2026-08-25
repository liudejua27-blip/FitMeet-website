import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const termsRoute = read('app/terms/page.tsx');
const privacyRoute = read('app/privacy/page.tsx');
const terms = read('lib/legal/terms-v1.tsx');
const privacy = read('lib/legal/privacy-v1.tsx');
const privacyV1_1 = read('lib/legal/privacy-v1-1.tsx');
const privacyV1_2 = read('lib/legal/privacy-v1-2.tsx');
const privacyV1_3 = read('lib/legal/privacy-v1-3.tsx');
const versions = read('app/legal/versions/page.tsx');
const termsSnapshot = read('app/legal/versions/terms-1.0/page.tsx');
const privacySnapshot = read('app/legal/versions/privacy-1.0/page.tsx');
const privacyV1_1Snapshot = read('app/legal/versions/privacy-1.1/page.tsx');
const privacyV1_2Snapshot = read('app/legal/versions/privacy-1.2/page.tsx');
const privacyV1_3Snapshot = read('app/legal/versions/privacy-1.3/page.tsx');
const thirdParties = read('app/privacy/third-parties/page.tsx');
const sitemap = read('app/sitemap.ts');
const footer = read('components/site-shell/SiteFooter.tsx');
const policyComponent = read('components/editorial-policy/EditorialPolicyPage.tsx');
const policyStyles = read('components/editorial-policy/editorial-policy.module.css');
const navigation = read('components/site-shell/SiteNavigation.tsx');
const navigationStyles = read('components/site-shell/site-shell.module.css');
const siteConfig = read('lib/site-config.ts');

test('legal pages are current documents rather than launch placeholders', () => {
  for (const source of [terms, privacyV1_3]) {
    assert.match(source, /"现行有效"/);
    assert.doesNotMatch(source, /上线前法务审核中|待正式发布|草案 1\.0/);
  }
  assert.match(terms, /version="1\.0"/);
  assert.match(terms, /effectiveDate="2026-07-29"/);
  assert.match(privacyV1_3, /versionOverride="1\.3"/);
  assert.match(privacyV1_3, /effectiveDateOverride="2026-08-25"/);
});

test('current routes render immutable versioned policy content', () => {
  assert.match(termsRoute, /TermsPolicyV1/);
  assert.match(privacyRoute, /PrivacyPolicyV1_3/);
  assert.match(termsRoute, /canonical: "\/terms"/);
  assert.match(privacyRoute, /canonical: "\/privacy"/);
});

test('legal pages use the verified public identity and contact contract', () => {
  assert.match(siteConfig, /legalEntityName: "晤云科技（青岛）有限公司"/);
  assert.match(siteConfig, /contactEmail: "support@fitmeet\.cn"/);
  assert.match(terms, /siteConfig\.legalEntityName/);
  assert.match(terms, /siteConfig\.contactEmail/);
  assert.match(privacy, /siteConfig\.legalEntityName/);
  assert.match(privacy, /siteConfig\.contactEmail/);
  assert.match(terms, /FitMeet 是产品及服务品牌/);
  assert.match(privacy, /FitMeet 是产品及服务品牌/);
  assert.doesNotMatch(siteConfig, /companyName: "晤云科技"/);
});

test('terms cover the assisted-social contract and real account deletion', () => {
  for (const phrase of [
    '年满 18 周岁',
    'Agent 与生成式人工智能',
    '匹配、推荐与人物画像',
    '多人活动、邀请与群聊',
    '线下见面与人身安全',
    '我的—注销账号',
    '有管辖权的人民法院',
  ]) assert.match(terms, new RegExp(phrase));

  assert.match(terms, /工具执行结果才是操作事实/);
  assert.match(terms, /不构成对任何用户的身份、动机、履约能力、安全性或适配程度的保证/);
});

test('privacy policy explicitly covers the App Store privacy contract', () => {
  for (const phrase of [
    '账号、登录与安全验证',
    '个人资料、照片与信任状态',
    'Agent 对话与生成式人工智能',
    '匹配、推荐与自动化处理',
    '近似位置与系统权限',
    '需求、动态、关系、消息与群聊',
    '受托处理与第三方服务',
    '境内存储与跨境处理',
    '保存期限与删除规则',
    '你的个人信息权利',
  ]) assert.match(privacy, new RegExp(phrase));

  for (const provider of ['阿里云', 'DeepSeek', 'Apple 系统服务', '邮箱投递服务']) {
    assert.match(privacy, new RegExp(provider));
  }

  assert.match(privacy, /不出售个人信息/);
  assert.match(privacy, /不以跨应用广告跟踪为目的/);
  assert.match(privacy, /我的—注销账号/);
  assert.match(privacy, /15 个工作日/);
});

test('privacy 1.1 describes manual nearby-radar check-in without changing the 1.0 snapshot', () => {
  for (const phrase of [
    '每次希望出现在附近推荐中时',
    '手动签到',
    '单次签到有效期为 4 小时',
    '不提供自动签到、后台续期或永久开启',
    '可以拒绝定位或拒绝签到',
    '不影响登录、资料、Agent、非附近匹配、消息等无关功能',
    '随时在附近雷达或隐私设置中选择“停止展示”',
    '同样处于有效手动签到状态',
    '安全规则和双方拉黑过滤',
    '模糊距离或城市、区域信息',
    '不会看到你的精确经纬度、实时定位点、移动轨迹',
  ]) assert.match(privacyV1_1, new RegExp(phrase));

  assert.match(privacySnapshot, /<PrivacyPolicyV1 snapshot/);
  assert.doesNotMatch(privacySnapshot, /PrivacyPolicyV1_1/);
  assert.match(privacyV1_1Snapshot, /<PrivacyPolicyV1_1 snapshot/);
});

test('privacy 1.2 requires explicit third-party AI consent and preserves earlier snapshots', () => {
  for (const phrase of [
    '第三方 AI 数据共享授权',
    'DeepSeek（深度求索）模型 API',
    '杭州深度求索人工智能基础技术研究有限公司及其关联公司',
    '未经该项明确授权',
    '文字、语音转写文本、你主动选择的压缩图片内容及图片说明',
    '文档中为当前请求提取的文本',
    '字段白名单、上下文裁剪、访问控制、日志脱敏',
    '相同或同等级别的保护',
    '撤回后立即停止新的第三方 AI 数据发送',
  ]) assert.match(privacyV1_2, new RegExp(phrase));

  assert.match(privacyV1_1Snapshot, /<PrivacyPolicyV1_1 snapshot/);
  assert.match(privacyV1_2Snapshot, /<PrivacyPolicyV1_2 snapshot/);
});

test('privacy 1.3 limits nearby radar to one foreground page session and preserves 1.2', () => {
  for (const phrase of [
    '每次进入附近雷达时',
    '确认本次展示',
    '不提供自动签到、后台签到、永久开启',
    '不影响登录、资料、Agent、非附近匹配、消息等其他功能',
    '仅在当前附近雷达页面处于前台时',
    '离开雷达页面、切换标签、打开候选详情、App 进入后台或退出登录时',
    '立即停止并清空',
    '不会自动重试或重新签到',
    '同样手动进入附近雷达',
    '不会看到你的精确经纬度、实时定位点、移动轨迹',
    '短时故障保护租约',
    '不是面向用户的展示时长',
    '不会开启位置读取或附近展示',
  ]) assert.match(privacyV1_3, new RegExp(phrase));

  assert.doesNotMatch(privacyV1_3, /4 小时|持续多久/);
  assert.match(privacyV1_2Snapshot, /<PrivacyPolicyV1_2 snapshot/);
  assert.match(privacyV1_3Snapshot, /<PrivacyPolicyV1_3 snapshot/);
});

test('policy template is semantic, keyboard accessible, and responsive', () => {
  assert.match(policyComponent, /className={styles\.skipLink}/);
  assert.match(policyComponent, /<h2 id={`section-title-/);
  assert.match(policyComponent, /aria-labelledby={`section-title-/);
  assert.doesNotMatch(policyStyles, /min-width:\s*1080px/);
  assert.match(policyStyles, /@media \(max-width: 900px\)/);
  assert.match(policyStyles, /@media \(max-width: 520px\)/);
  assert.match(policyStyles, /:focus-visible/);
  assert.match(navigation, /aria-controls="site-mobile-navigation"/);
  assert.match(navigation, /aria-label="移动导航"/);
  assert.match(navigationStyles, /@media \(max-width: 760px\)/);
  assert.match(navigationStyles, /\.mobilePanelOpen/);
});

test('legal version records and fixed snapshots are public and linked', () => {
  assert.match(versions, /法律文件版本记录/);
  assert.match(versions, /隐私政策》现行版本为 1\.3/);
  assert.match(versions, /版本 1\.0 是首个正式公开版本/);
  assert.match(versions, /siteConfig\.legalEntityName/);
  assert.match(versions, /FitMeet 是产品及服务品牌/);
  assert.match(versions, /联系地址尚待根据营业执照和运营资料核验/);
  assert.match(termsSnapshot, /<TermsPolicyV1 snapshot/);
  assert.match(privacySnapshot, /<PrivacyPolicyV1 snapshot/);
  assert.match(terms, /\/legal\/versions/);
  assert.match(privacy, /\/legal\/versions/);

  for (const path of [
    '/legal/versions',
    '/legal/versions/terms-1.0',
    '/legal/versions/privacy-1.0',
    '/legal/versions/privacy-1.1',
    '/legal/versions/privacy-1.2',
    '/legal/versions/privacy-1.3',
  ]) assert.match(sitemap, new RegExp(path.replaceAll('/', '\\/')));
});

test('third-party disclosure is specific, clickable, and requires explicit consent', () => {
  for (const phrase of [
    '阿里云基础设施与安全服务',
    '阿里企业邮箱投递服务',
    'DeepSeek 模型 API',
    'Apple 系统服务',
    '可能处理的信息',
    '第三方 AI 数据共享授权',
    '相同或同等级别的保护',
    '主动输入的文字、语音转写文本、主动选择的压缩图片内容',
  ]) assert.match(thirdParties, new RegExp(phrase));

  assert.match(thirdParties, /siteConfig\.legalEntityName/);

  assert.match(thirdParties, /href="https:\/\/terms\.alicdn\.com/);
  assert.match(thirdParties, /href="https:\/\/cdn\.deepseek\.com\/policies\/zh-CN\/deepseek-privacy-policy\.html"/);
  assert.match(thirdParties, /href="https:\/\/www\.apple\.com\/legal\/privacy\/"/);
  assert.match(thirdParties, /href="\/privacy"/);
  assert.match(terms, /href="\/privacy\/third-parties"/);
  assert.match(privacy, /href="\/privacy\/third-parties"/);
  assert.match(sitemap, /\/privacy\/third-parties/);
  assert.match(footer, /\/privacy\/third-parties/);
});

test('public legal routes contain no draft or prelaunch-review placeholder', () => {
  for (const source of [termsRoute, privacyRoute, terms, privacy, privacyV1_1, privacyV1_2, privacyV1_3, versions, termsSnapshot, privacySnapshot, privacyV1_1Snapshot, privacyV1_2Snapshot, privacyV1_3Snapshot, thirdParties]) {
    assert.doesNotMatch(source, /草案|上线前法务审核中|待正式发布/);
  }
});
