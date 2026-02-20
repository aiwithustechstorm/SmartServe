import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CoverCurtain.css';

/**
 * CoverCurtain — Cinematic dark-luxury splash that plays ONCE per session.
 * Slides up like a theatre curtain to reveal the page beneath.
 */
export default function CoverCurtain({ children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show once per browser session
    if (!sessionStorage.getItem('curtainSeen')) {
      setShow(true);

      // Auto-dismiss after the sequence finishes (~4.8 s)
      const timer = setTimeout(() => {
        sessionStorage.setItem('curtainSeen', '1');
        setShow(false);
      }, 4800);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            className="curtain"
            initial={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
          >
            {/* Atmosphere */}
            <div className="curtain__atmosphere" />
            <div className="curtain__stars" />
            <div className="curtain__line curtain__line--top" />
            <div className="curtain__line curtain__line--bottom" />

            {/* Logo with glow */}
            <motion.div
              className="curtain__logo-wrap"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="curtain__ring" />
              <div className="curtain__glow" />
              <img
                src="/aiwithus.png"
                alt="AI With Us"
                className="curtain__logo"
              />
            </motion.div>

            {/* Typography */}
            <div className="curtain__text">
              <motion.span
                className="curtain__presented"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
              >
                Presented by
              </motion.span>

              <motion.h1
                className="curtain__title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                AI <span className="curtain__title-accent">With Us</span>
              </motion.h1>

              <motion.div
                className="curtain__divider"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.8 }}
              />

              <motion.p
                className="curtain__subtitle"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 2.1 }}
              >
                TechStorm <span className="curtain__year">2026</span>
              </motion.p>
            </div>

            {/* Footer micro-label */}
            <motion.div
              className="curtain__footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.8 }}
            >
              <span className="curtain__team">AI Maestros — Intelligence & Humanity</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual page content always renders underneath */}
      {children}
    </>
  );
}
