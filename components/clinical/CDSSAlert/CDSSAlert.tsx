'use client';

import { AlertTriangle, Info } from 'lucide-react';
import styles from './CDSSAlert.module.css';

interface CDSSAlertProps {
  type: 'danger' | 'warning' | 'info';
  message: string;
  subMessage?: string;
}

export default function CDSSAlert({ type, message, subMessage }: CDSSAlertProps) {
  return (
    <div className={`${styles.alert} ${styles[type]} animate-fade-in`}>
      <div className={styles.icon}>
        {type === 'danger' || type === 'warning' ? <AlertTriangle size={20} /> : <Info size={20} />}
      </div>
      <div className={styles.content}>
        <h4 className={styles.message}>{message}</h4>
        {subMessage && <p className={styles.subMessage}>{subMessage}</p>}
      </div>
    </div>
  );
}
