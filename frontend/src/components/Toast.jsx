import { useEffect, useState } from 'react';
import { HiCheckCircle, HiExclamationCircle, HiInformationCircle } from 'react-icons/hi';
import './Toast.css';

const icons = {
  success: HiCheckCircle,
  error: HiExclamationCircle,
  info: HiInformationCircle,
};

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type] || icons.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast-notification toast-notification--${type} ${!visible ? 'toast-notification--exit' : ''}`}>
      <Icon className="toast-icon" />
      <span>{message}</span>
    </div>
  );
}
