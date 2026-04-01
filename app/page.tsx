'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { fhirClient } from '@/lib/fhir/fhirClient';
import { Patient } from '@/types/fhir';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await fhirClient.getPatients();
      setPatients(data);
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => {
    const nameStr = p.name?.[0]?.text?.toLowerCase() || '';
    const idStr = p.identifier?.[0]?.value || '';
    const searchTerm = search.toLowerCase();
    
    return nameStr.includes(searchTerm) || idStr.includes(searchTerm);
  });

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className="container" style={{ marginTop: '2rem' }}>
        <header className={styles.header}>
          <h1>Danh sách Bệnh nhân</h1>
          <p>Tìm kiếm và quản lý hồ sơ bệnh án chuẩn FHIR</p>
        </header>

        <section className={styles.searchSection}>
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc mã định danh (PID)..." 
            className={styles.searchBar}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            suppressHydrationWarning
          />
        </section>

        {loading ? (
          <div className={styles.placeholder}>Đang tải dữ liệu...</div>
        ) : (
          <div className={styles.patientGrid}>
            {filteredPatients.map(patient => (
              <div key={patient.id} className="card animate-fade-in" style={{ cursor: 'pointer' }}>
                <div className={styles.patientCardHeader}>
                  <div className={styles.avatarLarge}>
                    {patient.name?.[0].given?.[0]?.[0]}
                  </div>
                  <div>
                    <h3 className={styles.patientName}>{patient.name?.[0].text}</h3>
                    <p className={styles.patientId}>PID: {patient.identifier?.[0].value}</p>
                  </div>
                </div>
                
                <div className={styles.patientDetails}>
                  <div className={styles.detailItem}>
                    <span>Giới tính:</span>
                    <strong>{patient.gender === 'male' ? 'Nam' : 'Nữ'}</strong>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Ngày sinh:</span>
                    <strong>{patient.birthDate}</strong>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/patient/${patient.id}`);
                    }}
                  >
                    Xem hồ sơ
                  </button>
                  <button className="btn btn-primary" onClick={(e) => e.stopPropagation()}>Khám mới</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
