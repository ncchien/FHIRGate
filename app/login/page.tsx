'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    setLoading(true);
    // Simulate SMART on FHIR OAuth flow
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.loginCard} glass animate-fade-in`}>
        <div className={styles.header}>
          <div className={styles.logo}>FHIR<span>Gate</span></div>
          <p>Hệ sinh thái Cổng thông tin Bệnh án Điện tử</p>
        </div>
        
        <div className={styles.infoBox}>
          <h3>Cơ chế SMART on FHIR</h3>
          <p>Đăng nhập an toàn qua OAuth 2.0 & SMART on FHIR giúp bảo vệ dữ liệu nhạy cảm của bệnh nhân.</p>
          <div className={styles.badges}>
            <span className={styles.badge}>OAuth 2.0</span>
            <span className={styles.badge}>HL7 FHIR R4</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <input type="text" placeholder="Tên đăng nhập / Email" className={styles.input} />
          <input type="password" placeholder="Mật khẩu" className={styles.input} />
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', marginTop: '2rem' }}
        >
          {loading ? 'Đang xác thực bảo mật...' : 'Đăng nhập Hệ thống'}
        </button>

        <div className={styles.footer}>
          <p>Hệ thống tuân thủ <strong>Thông tư 46/2018/TT-BYT</strong></p>
          <p>© 2026 FHIRGate Team | VTM Standard</p>
        </div>
      </div>
    </div>
  );
}
