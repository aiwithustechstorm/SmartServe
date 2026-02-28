import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineArrowRight, HiOutlineClock } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const RESEND_COOLDOWN = 30; // seconds

export default function Login() {
  const [step, setStep] = useState('email'); // email | otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const otpRefs = useRef([]);

  const [devOtp, setDevOtp] = useState(null);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email });
      const code = res?.data?.dev_otp;
      if (code) {
        const digits = code.split('');
        setOtp(digits);
        setDevOtp(code);
      } else {
        setOtp(['', '', '', '', '', '']);
        setDevOtp(null);
      }
      setStep('otp');
      setResendTimer(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await login({ email });
      const code = res?.data?.dev_otp;
      if (code) {
        const digits = code.split('');
        setOtp(digits);
        setDevOtp(code);
      } else {
        setOtp(['', '', '', '', '', '']);
        setDevOtp(null);
      }
      setResendTimer(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await verifyOtp({ email, otp: otpString });
      if (data.user) {
        navigate(data.user.role === 'admin' ? '/admin' : from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__gradient" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-card">
          <div className="auth-card__header">
            <Link to="/" className="auth-logo">
              <img src="/logo.png" alt="SmartServe" className="auth-logo-img" />
            </Link>
            <h2>Welcome back</h2>
            <p>Sign in with your email to continue</p>
          </div>

          {step === 'email' ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-field">
                <HiOutlineMail className="auth-field__icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'} <HiOutlineArrowRight />
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-otp-section">
                {devOtp ? (
                  <p className="auth-otp-info" style={{ color: '#10b981', fontWeight: 600 }}>
                    Dev mode — OTP auto-filled: <strong>{devOtp}</strong>
                  </p>
                ) : (
                  <p className="auth-otp-info">
                    We sent a 6-digit OTP to <strong>{email}</strong>.<br />
                    Check your inbox (and spam folder).
                  </p>
                )}
                <div className="otp-boxes" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-box"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <div className="otp-timer-row">
                  <HiOutlineClock />
                  {resendTimer > 0 ? (
                    <span>Resend OTP in <strong>{resendTimer}s</strong></span>
                  ) : (
                    <button type="button" className="otp-resend-btn" onClick={handleResendOtp} disabled={loading}>
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'} <HiOutlineArrowRight />
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']); setDevOtp(null); }}>
                ← Change email
              </button>
            </form>
          )}

          <div className="auth-card__footer">
            <p>Don't have an account? <Link to="/register">Create one</Link></p>
            <p style={{marginTop: '0.5rem'}}>Are you an admin? <Link to="/admin-login">Admin Login</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
