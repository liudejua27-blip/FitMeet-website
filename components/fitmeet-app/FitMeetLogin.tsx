"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiRefreshCw,
  FiShield,
  FiUser,
} from "react-icons/fi";
import {
  fitMeetLoginValidationMessage,
  isValidFitMeetEmail,
  isValidFitMeetPassword,
  normalizeFitMeetEmail,
  type FitMeetAuthMode,
} from "@/lib/fitmeet-login-state";
import { FitMeetApiError } from "@/lib/fitmeet-api-client";
import {
  fitMeetRegistrationConsentFromExplicitChoice,
  type FitMeetRegistrationConsent,
} from "@/lib/fitmeet-registration-consent";
import { FitMeetBrandIcon } from "./FitMeetBrandIcon";
import styles from "./fitmeet-complete.module.css";

type FitMeetLoginProps = {
  onLogin: (email: string, password: string) => Promise<unknown>;
  onRegister: (
    email: string,
    password: string,
    name: string,
    consents: FitMeetRegistrationConsent,
  ) => Promise<unknown>;
  onResendEmailVerification: (email: string) => Promise<unknown>;
  initialError?: string | null;
};

type TouchedFields = {
  name: boolean;
  email: boolean;
  password: boolean;
  passwordConfirmation: boolean;
};

const untouchedFields: TouchedFields = {
  name: false,
  email: false,
  password: false,
  passwordConfirmation: false,
};

function authCooldownLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0
    ? `${minutes} 分 ${String(remainder).padStart(2, "0")} 秒`
    : `${remainder} 秒`;
}

export function FitMeetLogin({ onLogin, onRegister, onResendEmailVerification, initialError }: FitMeetLoginProps) {
  const [mode, setMode] = useState<FitMeetAuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [registrationConsent, setRegistrationConsent] = useState<FitMeetRegistrationConsent | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>(untouchedFields);
  const [error, setError] = useState(initialError || "");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const registering = mode === "register";
  const emailError = touched.email && !isValidFitMeetEmail(email);
  const passwordError = touched.password && !isValidFitMeetPassword(password);
  const nameError = registering && touched.name && !name.trim();
  const confirmationError =
    registering && touched.passwordConfirmation && password !== passwordConfirmation;

  useEffect(() => {
    setError(initialError || "");
  }, [initialError]);

  useEffect(() => {
    if (retryAfterSeconds <= 0) return;
    const timer = window.setTimeout(
      () => setRetryAfterSeconds((current) => Math.max(0, current - 1)),
      1_000,
    );
    return () => window.clearTimeout(timer);
  }, [retryAfterSeconds]);

  const authErrorMessage = (reason: unknown, fallback: string) => {
    if (reason instanceof FitMeetApiError && reason.status === 429) {
      const seconds = reason.retryAfterSeconds ?? 60;
      setRetryAfterSeconds(seconds);
      return `尝试次数过多，请在 ${authCooldownLabel(seconds)} 后重试。`;
    }
    return reason instanceof Error ? reason.message : fallback;
  };

  const switchMode = (nextMode: FitMeetAuthMode) => {
    if (nextMode === mode || submitting) return;
    setMode(nextMode);
    setPassword("");
    setPasswordConfirmation("");
    setRegistrationConsent(null);
    setShowPassword(false);
    setShowPasswordConfirmation(false);
    setTouched(untouchedFields);
    setError("");
    setNotice("");
    setVerificationEmail("");
    setRetryAfterSeconds(0);
    window.requestAnimationFrame(() => emailInputRef.current?.focus());
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (retryAfterSeconds > 0) {
      setError(`尝试次数过多，请在 ${authCooldownLabel(retryAfterSeconds)} 后重试。`);
      return;
    }
    setTouched({
      name: registering,
      email: true,
      password: true,
      passwordConfirmation: registering,
    });
    const validationMessage = fitMeetLoginValidationMessage({
      mode,
      name,
      email,
      password,
      passwordConfirmation,
      agreementAccepted: registrationConsent !== null,
    });
    if (validationMessage) return setError(validationMessage);

    setSubmitting(true);
    setError("");
    setNotice("");
    try {
      const normalizedEmail = normalizeFitMeetEmail(email);
      if (registering) {
        if (!registrationConsent) {
          setError("请先同意《用户协议》和《隐私政策》。");
          return;
        }
        const result = await onRegister(normalizedEmail, password, name.trim(), registrationConsent);
        if (!result || typeof result !== "object" || (result as { status?: unknown }).status !== "verification_required")
          throw new Error("注册响应不完整，请稍后重试。");
        setMode("login");
        setPassword("");
        setPasswordConfirmation("");
        setRegistrationConsent(null);
        setTouched(untouchedFields);
        setVerificationEmail(normalizedEmail);
        setNotice("验证邮件已发送。请先完成邮箱验证，再使用刚才的邮箱登录。");
      } else {
        await onLogin(normalizedEmail, password);
      }
      setRetryAfterSeconds(0);
    } catch (reason) {
      if (reason instanceof FitMeetApiError && reason.code === "EMAIL_NOT_VERIFIED") {
        setVerificationEmail(normalizeFitMeetEmail(email));
      }
      setError(authErrorMessage(
        reason,
        registering
          ? "暂时无法创建账号，请稍后重试。"
          : "登录暂时不可用，请稍后重试。",
      ));
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    if (!verificationEmail || resending || submitting || retryAfterSeconds > 0) return;
    setResending(true);
    setError("");
    try {
      await onResendEmailVerification(verificationEmail);
      setNotice("如果该邮箱仍待验证，新的验证邮件已发送。请检查收件箱和垃圾邮件目录。");
    } catch (reason) {
      setError(authErrorMessage(reason, "验证邮件暂时无法发送，请稍后重试。"));
    } finally {
      setResending(false);
    }
  };

  const markTouched = (field: keyof TouchedFields) =>
    setTouched((current) => ({ ...current, [field]: true }));

  return (
    <main className={`${styles.appPage} ${styles.emailAuthPage}`}>
      <section className={styles.emailAuthShell} aria-label="FitMeet 邮箱账号入口">
        <aside className={styles.emailAuthStory}>
          <div className={styles.emailAuthBrand}>
            <FitMeetBrandIcon
              size={62}
              priority
              src="/brand/fitmeet-login-icon.png"
            />
            <strong>FitMeet</strong>
          </div>
          <div className={styles.emailAuthStoryCopy}>
            <h1>从一次舒服的连接开始。</h1>
            <p>
              登录后同步你的 Agent 对话、匹配、消息与个人资料。所有真实发布、邀请和消息动作仍需你确认。
            </p>
          </div>
          <div className={styles.emailAuthPromise}>
            <FiShield />
            <span>你的账号状态以 FitMeet 服务端为准，网页不会保存刷新凭证。</span>
          </div>
        </aside>

        <section
          className={`${styles.emailAuthPanel} ${registering ? styles.emailAuthPanelRegister : ""}`}
          aria-labelledby="fitmeet-auth-title"
        >
          <header className={styles.emailAuthPanelHeader}>
            <span className={styles.emailAuthMobileBrand}>
              <FitMeetBrandIcon
                size={48}
                priority
                src="/brand/fitmeet-login-icon.png"
              />
              <strong>FitMeet</strong>
            </span>
            <h2 id="fitmeet-auth-title">{registering ? "创建 FitMeet 账号" : "欢迎回来"}</h2>
            <p>{registering ? "使用邮箱创建账号，并继续完善你的社交资料。" : "使用你的 FitMeet 邮箱账号继续。"}</p>
          </header>

          <div className={styles.emailAuthTabs} role="tablist" aria-label="账号入口">
            {(["login", "register"] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={mode === item}
                aria-controls="fitmeet-auth-form"
                tabIndex={mode === item ? 0 : -1}
                onClick={() => switchMode(item)}
              >
                {item === "login" ? "登录" : "注册"}
              </button>
            ))}
          </div>

          <form id="fitmeet-auth-form" onSubmit={submit} aria-busy={submitting} noValidate>
            {registering ? (
              <label className={nameError ? styles.loginFieldError : undefined}>
                <span>展示昵称</span>
                <div className={styles.emailAuthInput}>
                  <FiUser />
                  <input
                    value={name}
                    name="name"
                    type="text"
                    maxLength={32}
                    autoComplete="name"
                    placeholder="怎么称呼你"
                    disabled={submitting}
                    onBlur={() => markTouched("name")}
                    onChange={(event) => {
                      setName(event.target.value);
                      setError("");
                    }}
                    aria-invalid={nameError}
                    aria-describedby="fitmeet-name-hint"
                  />
                </div>
                <small id="fitmeet-name-hint" className={styles.loginFieldHint}>
                  {nameError ? "请输入展示昵称" : "之后可在个人资料中修改"}
                </small>
              </label>
            ) : null}

            <label className={emailError ? styles.loginFieldError : undefined}>
              <span>邮箱地址</span>
              <div className={styles.emailAuthInput}>
                <FiMail />
                <input
                  ref={emailInputRef}
                  value={email}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  enterKeyHint="next"
                  maxLength={254}
                  placeholder="name@example.com"
                  disabled={submitting}
                  autoFocus
                  onBlur={() => markTouched("email")}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  aria-invalid={emailError}
                  aria-describedby="fitmeet-email-hint"
                />
              </div>
              <small id="fitmeet-email-hint" className={styles.loginFieldHint}>
                {emailError ? "请输入有效邮箱地址" : "仅开放邮箱账号登录"}
              </small>
            </label>

            <label className={passwordError ? styles.loginFieldError : undefined}>
              <span>密码</span>
              <div className={styles.emailAuthInput}>
                <FiLock />
                <input
                  value={password}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  maxLength={72}
                  autoComplete={registering ? "new-password" : "current-password"}
                  enterKeyHint={registering ? "next" : "done"}
                  placeholder={registering ? "设置 8–72 位密码" : "输入密码"}
                  disabled={submitting}
                  onBlur={() => markTouched("password")}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  aria-invalid={passwordError}
                  aria-describedby="fitmeet-password-hint"
                />
                <button
                  type="button"
                  className={styles.emailAuthReveal}
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "隐藏密码" : "显示密码"}
                  aria-pressed={showPassword}
                  disabled={submitting}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <small id="fitmeet-password-hint" className={styles.loginFieldHint}>
                {passwordError ? "密码需要 8–72 位" : registering ? "请勿使用其他网站的相同密码" : "密码区分大小写"}
              </small>
            </label>

            {!registering ? (
              <div className={styles.emailAuthRecoveryLink}>
                <Link href="/auth/password/forgot">忘记密码？</Link>
              </div>
            ) : null}

            {registering ? (
              <label className={confirmationError ? styles.loginFieldError : undefined}>
                <span>确认密码</span>
                <div className={styles.emailAuthInput}>
                  <FiCheck />
                  <input
                    value={passwordConfirmation}
                    name="passwordConfirmation"
                    type={showPasswordConfirmation ? "text" : "password"}
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    enterKeyHint="done"
                    placeholder="再次输入密码"
                    disabled={submitting}
                    onBlur={() => markTouched("passwordConfirmation")}
                    onChange={(event) => {
                      setPasswordConfirmation(event.target.value);
                      setError("");
                    }}
                    aria-invalid={confirmationError}
                    aria-describedby="fitmeet-password-confirmation-hint"
                  />
                  <button
                    type="button"
                    className={styles.emailAuthReveal}
                    onClick={() => setShowPasswordConfirmation((visible) => !visible)}
                    aria-label={showPasswordConfirmation ? "隐藏确认密码" : "显示确认密码"}
                    aria-pressed={showPasswordConfirmation}
                    disabled={submitting}
                  >
                    {showPasswordConfirmation ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <small id="fitmeet-password-confirmation-hint" className={styles.loginFieldHint}>
                  {confirmationError ? "两次输入的密码不一致" : "请再次输入以确认"}
                </small>
              </label>
            ) : null}

            {registering ? (
              <label className={styles.loginAgreement}>
                <input
                  type="checkbox"
                  checked={registrationConsent !== null}
                  disabled={submitting}
                  onChange={(event) => {
                    setRegistrationConsent(
                      fitMeetRegistrationConsentFromExplicitChoice(event.target.checked),
                    );
                    setError("");
                  }}
                />
                <span>
                  我已阅读并同意 <Link href="/terms">《用户协议》</Link> 和{" "}
                  <Link href="/privacy">《隐私政策》</Link>
                </span>
              </label>
            ) : null}

            {error ? (
              <div className={styles.loginNoticeGroup}>
                <p className={styles.loginError} role="alert">
                  <FiAlertCircle />
                  {error}
                </p>
                {verificationEmail && !notice ? (
                  <button
                    className={styles.loginNoticeAction}
                    type="button"
                    disabled={submitting || resending || retryAfterSeconds > 0}
                    onClick={() => void resendVerification()}
                  >
                    <FiRefreshCw /> {resending
                      ? "正在重新发送…"
                      : retryAfterSeconds > 0
                        ? `${authCooldownLabel(retryAfterSeconds)}后重试`
                        : "重新发送验证邮件"}
                  </button>
                ) : null}
              </div>
            ) : null}

            {notice ? (
              <div className={styles.loginNoticeGroup}>
                <p className={styles.loginSuccess} role="status">
                  <FiCheck />
                  {notice}
                </p>
                {verificationEmail ? (
                  <button
                    className={styles.loginNoticeAction}
                    type="button"
                    disabled={submitting || resending || retryAfterSeconds > 0}
                    onClick={() => void resendVerification()}
                  >
                    <FiRefreshCw /> {resending
                      ? "正在重新发送…"
                      : retryAfterSeconds > 0
                        ? `${authCooldownLabel(retryAfterSeconds)}后重试`
                        : "没有收到？重新发送"}
                  </button>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              className={`${styles.primaryButton} ${submitting ? styles.spinIcon : ""}`}
              disabled={submitting || retryAfterSeconds > 0}
            >
              {submitting ? (
                <>
                  <FiRefreshCw /> {registering ? "正在创建账号…" : "正在安全登录…"}
                </>
              ) : retryAfterSeconds > 0 ? (
                <>
                  <FiLock /> {authCooldownLabel(retryAfterSeconds)}后重试
                </>
              ) : (
                <>
                  {registering ? "创建账号" : "登录 FitMeet"} <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <p className={styles.emailAuthSwitch}>
            {registering ? "已有账号？" : "还没有账号？"}
            <button type="button" disabled={submitting} onClick={() => switchMode(registering ? "login" : "register")}>
              {registering ? "返回登录" : "创建账号"}
            </button>
          </p>

          <div className={styles.emailAuthSafety}>
            <p><FiShield /> 登录凭证仅用于账号安全与恢复登录。</p>
            <p>遇到登录问题？<a href="mailto:support@fitmeet.cn">联系支持</a></p>
          </div>
          <footer className={styles.emailAuthFooter}>
            <Link href="/terms">用户协议</Link>
            <Link href="/privacy">隐私政策</Link>
          </footer>
        </section>
      </section>
    </main>
  );
}
