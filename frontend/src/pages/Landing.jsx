import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineLightningBolt, HiOutlineClock, HiOutlineShieldCheck } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const features = [
  {
    icon: HiOutlineLightningBolt,
    title: 'Instant Ordering',
    desc: 'Skip the line. Order from your phone and pick up when ready.',
  },
  {
    icon: HiOutlineClock,
    title: 'Real-time Tracking',
    desc: 'Watch your order move from kitchen to counter in real time.',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Secure Payments',
    desc: 'OTP-verified accounts with encrypted transactions.',
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-grid" />
        <div className="hero__gradient" />
        <div className="container hero__inner">
          <motion.div
            className="hero__content"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div className="hero__logo" variants={fadeUp}>
              <img src="/logo.png" alt="SmartServe" className="landing-logo" />
            </motion.div>

            <motion.div className="hero__tag" variants={fadeUp}>
              <span className="hero__tag-dot" />
              Campus Food Revolution
            </motion.div>

            <motion.h1 className="hero__title" variants={fadeUp}>
              Eat Smart.
              <br />
              <span className="hero__title-accent">Order Faster.</span>
            </motion.h1>

            <motion.p className="hero__subtitle" variants={fadeUp}>
              The digital canteen experience for modern campuses. Browse, order,
              and track — all from your device.
            </motion.p>

            <motion.div className="hero__actions" variants={fadeUp}>
              <Link to={isAuthenticated ? '/menu' : '/login'} className="btn btn-primary btn-lg">
                {isAuthenticated ? 'Browse Menu' : '🎓 Student Login'} <HiOutlineArrowRight />
              </Link>
              <Link to="/admin-login" className="btn btn-secondary btn-lg">
                🔐 Admin Login
              </Link>
            </motion.div>

            {!isAuthenticated && (
              <motion.p className="hero__register-link" variants={fadeUp}>
                New student? <Link to="/register">Create an account</Link>
              </motion.p>
            )}

            <motion.div className="hero__stats" variants={fadeUp}>
              <div className="hero__stat">
                <span className="hero__stat-number">500+</span>
                <span className="hero__stat-label">Daily Orders</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-number">50+</span>
                <span className="hero__stat-label">Menu Items</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-number">&lt;5min</span>
                <span className="hero__stat-label">Avg Wait</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero__card hero__card--1">
              <span>🍔</span>
              <div>
                <strong>Classic Burger</strong>
                <small>₹149</small>
              </div>
            </div>
            <div className="hero__card hero__card--2">
              <span>🍕</span>
              <div>
                <strong>Margherita Pizza</strong>
                <small>₹199</small>
              </div>
            </div>
            <div className="hero__card hero__card--3">
              <span>☕</span>
              <div>
                <strong>Cold Brew</strong>
                <small>₹89</small>
              </div>
            </div>
            <div className="hero__glow" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <motion.div
            className="features__grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((f, i) => (
              <motion.div key={i} className="feature-card" variants={fadeUp}>
                <div className="feature-card__icon">
                  <f.icon />
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to skip the queue?</h2>
            <p>Join hundreds of students already using SmartServe.</p>
            <Link to={isAuthenticated ? '/menu' : '/register'} className="btn btn-primary btn-lg">
              {isAuthenticated ? 'Order Now' : 'Create Account'} <HiOutlineArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
