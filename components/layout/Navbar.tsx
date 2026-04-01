'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Languages, User } from 'lucide-react';
import { useAppContext } from '@/lib/contexts/AppContext';
import styles from './navbar.module.css';

const translations = {
  vi: {
    patients: 'Bệnh nhân',
    dashboard: 'Quản trị',
    ingestion: 'Đẩy dữ liệu',
    doctor: 'BS',
    name: 'Nguyễn Quân',
    role: 'Bác sĩ nội khoa'
  },
  en: {
    patients: 'Patients',
    dashboard: 'Admin',
    ingestion: 'Ingestion',
    doctor: 'Dr',
    name: 'Nguyen Quan',
    role: 'Internal Physician'
  }
};

export default function Navbar() {
  const { theme, language, toggleTheme, setLanguage } = useAppContext();
  const t = translations[language];
  const pathname = usePathname();

  return (
    <nav className={`${styles.navbar} glass`}>
      <div className={`${styles.container} container`}>
        <div className={styles.logo}>
          <Link href="/">FHIR<span>Gate</span></Link>
        </div>
        
        <div className={styles.links}>
          <Link href="/" className={pathname === '/' ? styles.active : ''}>{t.patients}</Link>
          <Link href="/dashboard" className={pathname === '/dashboard' ? styles.active : ''}>{t.dashboard}</Link>
          <Link href="/ingestion" className={pathname === '/ingestion' ? styles.active : ''}>{t.ingestion}</Link>
        </div>

        <div className={styles.actions}>
          <button onClick={toggleTheme} className={styles.iconBtn} title="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <button 
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} 
            className={styles.iconBtn} 
            title="Toggle Language"
          >
            <Languages size={20} />
            <span className={styles.langLabel}>{language.toUpperCase()}</span>
          </button>

          <div className={styles.divider}></div>

          <div className={styles.profile}>
            <div className={styles.avatar}>{t.doctor}</div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{t.doctor}. {t.name}</p>
              <p className={styles.userRole}>{t.role}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
