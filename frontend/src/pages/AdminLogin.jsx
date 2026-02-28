import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineArrowRight, HiOutlineShieldCheck, HiOutlineClock } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const RESEND_COOLDOWN = 30;

export default function AdminLogin() {
  const [step, setStep] = useState('email'); // email | otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const { adminLogin, verifyOtp, logout } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

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
      const res = await adminLogin({ email });
      const code = res?.data?.dev_otp;
      if (code) {
        setOtp(code.split(''));
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
      const res = await adminLogin({ email });
      const code = res?.data?.dev_otp;
      if (code) {
        setOtp(code.split(''));
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
        if (data.user.role !== 'admin') {
          logout();
          setError('This account does not have admin privileges. Please use the Student login.');
          setLoading(false);
          return;
        }
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--admin">
      <div className="auth-bg">
        <div className="auth-bg__gradient auth-bg__gradient--admin" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="auth-card auth-card--admin">
          <div className="auth-card__header">
            <Link to="/" className="auth-logo">
              <img src="/logo.png" alt="SmartServe" className="auth-logo-img" />
            </Link>
            <div className="auth-admin-badge">
              <HiOutlineShieldCheck /> Admin Panel
            </div>
            <h2>Admin Login</h2>
            <p>Access the canteen management dashboard</p>
          </div>

          {step === 'email' ? (
            <form className="auth-form" onSubmit={handleSendOtp}>
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-field">
                <HiOutlineMail className="auth-field__icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Admin email address"
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
                    OTP sent to <strong>{email}</strong>.<br />
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
                {loading ? 'Verifying...' : 'Verify & Enter Dashboard'} <HiOutlineArrowRight />
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']); setDevOtp(null); }}>
                ← Change email
              </button>
            </form>
          )}

          <div className="auth-card__footer">
            <p>Are you a student? <Link to="/login">User Login</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
