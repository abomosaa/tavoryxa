import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, LogIn, LogOut, LockKeyhole, Mail } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Lang } from './catalogue';
import { getRecoveryGrant, supabase } from './supabase';
import { authConfig } from './auth-config';
import {
  authErrorKind,
  authRedirect,
  loadAuthSettings,
  passwordIssue,
  updateRecoveryPassword,
  type AuthCapabilities,
} from './auth';

type Mode = 'signin' | 'signup' | 'forgot';
export function AuthPanel({
  lang,
  user,
  recoveryUserId,
  recoveryRequested,
  onGuest,
  onRecoveryComplete,
}: {
  lang: Lang;
  user: User | null;
  recoveryUserId: string | null;
  recoveryRequested: boolean;
  onGuest: () => void;
  onRecoveryComplete: () => void;
}) {
  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);
  const [mode, setMode] = useState<Mode>('signin');
  const [capabilities, setCapabilities] = useState<AuthCapabilities | null>(null);
  const [settingsState, setSettingsState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState('');
  const mounted = useRef(true),
    action = useRef(0);
  const recovery = Boolean(user && recoveryUserId === user.id);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      action.current++;
    };
  }, []);
  useEffect(() => {
    // Recovery is a different credential task even when the user ID stays the same.
    action.current++;
    setPassword('');
    setConfirmation('');
    setError('');
    setMessage('');
    setBusy(false);
  }, [recovery]);
  useEffect(() => {
    if (user) return;
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    setSettingsState('loading');
    setCapabilities(null);
    loadAuthSettings(controller.signal)
      .then((settings) => {
        if (active) {
          setCapabilities(settings);
          setSettingsState('ready');
        }
      })
      .catch(() => {
        if (active) setSettingsState('failed');
      });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [reload, user?.id]);
  function changeMode(next: Mode) {
    action.current++;
    setMode(next);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmation('');
    setBusy(false);
  }
  function friendlyError(value: unknown, signingIn = false) {
    const kind = authErrorKind(value);
    if (kind === 'rate')
      return t(
        'طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.',
        'Too many attempts. Please wait a little and retry.',
      );
    if (kind === 'confirmation')
      return t(
        'أكد بريدك من رابط الرسالة ثم سجّل الدخول.',
        'Confirm your email using the message link, then sign in.',
      );
    if (kind === 'password')
      return t(
        'اختر كلمة مرور أقوى ومختلفة ثم أعد المحاولة.',
        'Choose a stronger, different password and try again.',
      );
    return signingIn
      ? t(
          'راجع البريد وكلمة المرور، أو استخدم طريقة دخولك المعتادة.',
          'Check your email and password, or use your usual sign-in method.',
        )
      : t(
          'تعذرت العملية. أعد المحاولة لاحقًا أو أكمل كضيف.',
          'This could not be completed. Try later or continue as a guest.',
        );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    setError('');
    setMessage('');
    const allowed =
      recovery ||
      (capabilities?.email &&
        (mode === 'signin' ||
          (authConfig.emailDeliveryEnabled && (mode !== 'signup' || capabilities.signup))));
    if (!allowed) return;
    if (recovery || mode === 'signup') {
      const issue = passwordIssue(password, confirmation);
      if (issue) {
        setError(
          issue === 'mismatch'
            ? t('كلمتا المرور غير متطابقتين.', 'The passwords do not match.')
            : t('استخدم كلمة مرور من 8 إلى 128 حرفًا.', 'Use a password of 8 to 128 characters.'),
        );
        return;
      }
    }
    const request = ++action.current;
    setBusy(true);
    try {
      if (recovery) {
        const grant = getRecoveryGrant();
        if (!grant || grant.owner !== user?.id || grant.owner !== recoveryUserId) {
          throw new Error('Recovery expired');
        }
        await updateRecoveryPassword(
          grant,
          password,
          () => mounted.current && request === action.current && getRecoveryGrant() === grant,
        );
        if (!mounted.current || request !== action.current) return;
        if (getRecoveryGrant() !== grant) return;
        onRecoveryComplete();
      } else if (mode === 'signin') {
        const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (!mounted.current || request !== action.current) return;
        if (result.error) throw result.error;
        setMessage(t('تم تسجيل الدخول.', 'You are signed in.'));
      } else if (mode === 'signup') {
        const result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: authRedirect() },
        });
        if (!mounted.current || request !== action.current) return;
        if (result.error) throw result.error;
        setMessage(
          t(
            'راجع بريدك لتأكيد الحساب. إذا كان لديك حساب بالفعل، انتقل إلى تسجيل الدخول.',
            'Check your email to confirm your account. If you already have an account, use sign in.',
          ),
        );
      } else {
        const result = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: authRedirect(true),
        });
        if (!mounted.current || request !== action.current) return;
        if (result.error) throw result.error;
        setMessage(
          t(
            'إذا كان الحساب مؤهلًا، ستصلك رسالة استعادة. افتح الرابط في هذا المتصفح.',
            'If the account is eligible, a reset email will arrive. Open its link in this browser.',
          ),
        );
      }
    } catch (failure) {
      if (mounted.current && request === action.current)
        setError(friendlyError(failure, mode === 'signin' && !recovery));
    } finally {
      if (mounted.current && request === action.current) {
        setBusy(false);
        setPassword('');
        setConfirmation('');
      }
    }
  }
  async function oauth(provider: 'google' | 'github') {
    if (!supabase || busy || !capabilities?.[provider]) return;
    const request = ++action.current;
    setBusy(true);
    setError('');
    setMessage('');
    setPassword('');
    setConfirmation('');
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: authRedirect() },
      });
      if (result.error) throw result.error;
    } catch (failure) {
      if (mounted.current && request === action.current) setError(friendlyError(failure));
    } finally {
      if (mounted.current && request === action.current) setBusy(false);
    }
  }
  async function signOut() {
    if (!supabase || busy) return;
    const request = ++action.current;
    setBusy(true);
    setError('');
    try {
      const result = await supabase.auth.signOut();
      if (result.error) throw result.error;
    } catch (failure) {
      if (mounted.current && request === action.current) setError(friendlyError(failure));
    } finally {
      if (mounted.current && request === action.current) setBusy(false);
    }
  }
  const unavailable =
    mode === 'signup'
      ? t(
          'إنشاء الحساب بالبريد غير متاح مؤقتًا. يمكنك تسجيل الدخول أو التصفح كضيف.',
          'Email registration is temporarily unavailable. You can sign in or browse as a guest.',
        )
      : t(
          'استعادة كلمة المرور غير متاحة مؤقتًا. حاول لاحقًا أو أكمل كضيف.',
          'Password reset is temporarily unavailable. Try later or continue as a guest.',
        );
  const canSubmit =
    recovery ||
    Boolean(
      capabilities?.email &&
      (mode === 'signin' ||
        (authConfig.emailDeliveryEnabled && (mode !== 'signup' || capabilities.signup))),
    );
  return (
    <div className="auth-panel">
      {user && !recovery ? (
        <>
          <p className="signed-in">
            <Check size={18} />
            {user.email || t('حساب متصل', 'Account connected')}
          </p>
          {recoveryRequested && (
            <p className="mode-note">
              {t(
                'رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا إذا احتجت إليه.',
                'The reset link is invalid or expired. Request a new link if needed.',
              )}
            </p>
          )}
          <button className="secondary full" onClick={() => void signOut()} disabled={busy}>
            <LogOut size={18} />
            {t('تسجيل الخروج', 'Sign out')}
          </button>
        </>
      ) : (
        <>
          {recovery ? (
            <div className="auth-heading">
              <LockKeyhole size={20} />
              <h3>{t('كلمة مرور جديدة', 'Choose a new password')}</h3>
            </div>
          ) : (
            <>
              <div
                className="auth-tabs"
                role="group"
                aria-label={t('خيارات الحساب', 'Account options')}
              >
                <button
                  aria-pressed={mode === 'signin'}
                  className={mode === 'signin' ? 'active' : ''}
                  onClick={() => changeMode('signin')}
                >
                  {t('تسجيل الدخول', 'Sign in')}
                </button>
                <button
                  aria-pressed={mode === 'signup'}
                  className={mode === 'signup' ? 'active' : ''}
                  onClick={() => changeMode('signup')}
                >
                  {t('إنشاء حساب', 'Create account')}
                </button>
              </div>
              {recoveryRequested && (
                <p className="mode-note" role="status">
                  {t(
                    'رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطًا جديدًا.',
                    'The reset link is invalid or expired. Request a new link.',
                  )}
                </p>
              )}
              {mode === 'forgot' && (
                <h3 className="auth-subtitle">{t('استعادة كلمة المرور', 'Reset your password')}</h3>
              )}
            </>
          )}
          {!recovery && settingsState === 'loading' ? (
            <p className="mode-note" role="status">
              {t('جارٍ تحميل خيارات الدخول…', 'Loading sign-in options…')}
            </p>
          ) : !recovery && settingsState === 'failed' ? (
            <div className="mode-note">
              <p role="status">
                {t(
                  'تعذر تحميل خيارات الدخول. أعد المحاولة أو أكمل كضيف.',
                  'Sign-in options could not be loaded. Retry or continue as a guest.',
                )}
              </p>
              <button className="text-link" onClick={() => setReload((x) => x + 1)}>
                {t('إعادة المحاولة', 'Retry')}
              </button>
            </div>
          ) : (
            <>
              {canSubmit ? (
                <form className="auth-form" onSubmit={(event) => void submit(event)}>
                  {!recovery && (
                    <label className="field" htmlFor="auth-email">
                      {t('البريد الإلكتروني', 'Email address')}
                      <input
                        id="auth-email"
                        type="email"
                        name="email"
                        dir="ltr"
                        required
                        maxLength={254}
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={busy}
                      />
                    </label>
                  )}
                  {(recovery || mode !== 'forgot') && (
                    <label className="field" htmlFor="auth-password">
                      {recovery
                        ? t('كلمة المرور الجديدة', 'New password')
                        : t('كلمة المرور', 'Password')}
                      <input
                        id="auth-password"
                        type="password"
                        name="password"
                        dir="ltr"
                        required
                        minLength={mode === 'signin' && !recovery ? 1 : 8}
                        maxLength={128}
                        autoComplete={
                          mode === 'signin' && !recovery ? 'current-password' : 'new-password'
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={busy}
                      />
                    </label>
                  )}
                  {(recovery || mode === 'signup') && (
                    <label className="field" htmlFor="auth-confirm">
                      {t('تأكيد كلمة المرور', 'Confirm password')}
                      <input
                        id="auth-confirm"
                        type="password"
                        name="confirmation"
                        dir="ltr"
                        required
                        minLength={8}
                        maxLength={128}
                        autoComplete="new-password"
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        disabled={busy}
                      />
                    </label>
                  )}
                  {(recovery || mode === 'signup') && (
                    <p className="auth-hint">
                      {t(
                        '8 أحرف على الأقل. استخدم كلمة مرور فريدة.',
                        'At least 8 characters. Use a unique password.',
                      )}
                    </p>
                  )}
                  <button className="primary full" disabled={busy} type="submit">
                    {mode === 'forgot' ? <Mail size={18} /> : <LogIn size={18} />}{' '}
                    {busy
                      ? t('جارٍ المتابعة…', 'Please wait…')
                      : recovery
                        ? t('حفظ كلمة المرور', 'Save new password')
                        : mode === 'signup'
                          ? t('إنشاء الحساب', 'Create your account')
                          : mode === 'forgot'
                            ? t('إرسال رابط الاستعادة', 'Send reset link')
                            : t('دخول بالبريد', 'Sign in with email')}
                  </button>
                </form>
              ) : (
                <p className="mode-note" role="status">
                  {capabilities?.email
                    ? unavailable
                    : t(
                        'الدخول بالبريد غير متاح حاليًا. يمكنك التصفح كضيف.',
                        'Email sign-in is unavailable right now. You can browse as a guest.',
                      )}
                </p>
              )}
              {!recovery && mode === 'signin' && capabilities?.email && (
                <button className="text-link auth-forgot" onClick={() => changeMode('forgot')}>
                  {t('نسيت كلمة المرور؟', 'Forgot password?')}
                </button>
              )}
              {!recovery && (capabilities?.google || capabilities?.github) && (
                <div className="auth-providers">
                  <p>{t('أو تابع باستخدام', 'Or continue with')}</p>
                  {capabilities.google && (
                    <button
                      className="secondary full"
                      disabled={busy}
                      onClick={() => void oauth('google')}
                    >
                      <GoogleMark />
                      {t('المتابعة باستخدام Google', 'Continue with Google')}
                    </button>
                  )}
                  {capabilities.github && (
                    <button
                      className="secondary full"
                      disabled={busy}
                      onClick={() => void oauth('github')}
                    >
                      GitHub
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {!recovery && mode === 'forgot' && (
            <button className="text-link" onClick={() => changeMode('signin')}>
              {t('العودة لتسجيل الدخول', 'Back to sign in')}
            </button>
          )}
        </>
      )}
      {message && (
        <p className="auth-success" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button className="secondary full" onClick={onGuest}>
        {user ? t('متابعة التسوق', 'Continue shopping') : t('أكمل كضيف', 'Continue as a guest')}
      </button>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-1.99 3.03v2.52h3.23c1.89-1.74 2.98-4.3 2.98-7.38Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.23-2.52c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.12H3.05v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93a6.01 6.01 0 0 1 0-3.86v-2.6H3.05a10 10 0 0 0 0 9.06l3.34-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.51 3.83 1.52l2.87-2.87A9.61 9.61 0 0 0 12 2a10 10 0 0 0-8.95 5.47l3.34 2.6A5.99 5.99 0 0 1 12 5.95Z"
      />
    </svg>
  );
}
