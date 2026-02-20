import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineArrowRight } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const [step, setStep] = useState('email'); // email | otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email });
      // Backend returns OTP in dev mode for convenience
      const otpFromServer = res?.data?.otp;
      if (otpFromServer) setDevOtp(otpFromServer);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await verifyOtp({ email, otp });
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
                <p className="auth-otp-info">
                  We sent an OTP to <strong>{email}</strong>
                </p>
                {devOtp && (
                  <p className="auth-dev-otp">
                    Dev OTP: <strong>{devOtp}</strong>
                  </p>
                )}
                <div className="auth-field">
                  <input
                    type="text"
                    className="input-field otp-input"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'} <HiOutlineArrowRight />
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStep('email'); setError(''); }}>
                Change email
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
