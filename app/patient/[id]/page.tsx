'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { fhirClient } from '@/lib/fhir/fhirClient';
import { Patient, Observation, Condition, MedicationRequest, AllergyIntolerance } from '@/types/fhir';
import AISummary from '@/components/clinical/AISummary/AISummary';
import VitalsChart from '@/components/clinical/VitalsChart/VitalsChart';
import CDSSAlert from '@/components/clinical/CDSSAlert/CDSSAlert';
import VoiceToText from '@/components/clinical/VoiceToText/VoiceToText';
import { ArrowLeft, Activity, Thermometer, Droplets, Pill, AlertCircle, Clock, FileText, ChevronRight } from 'lucide-react';
import styles from './patient.module.css';
import { auditLogClient } from '@/lib/audit/auditLogClient';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [medications, setMedications] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'vitals' | 'history' | 'prescribe'>('summary');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [p, obs, conds, meds] = await Promise.all([
        fhirClient.getPatientById(id),
        fhirClient.getObservationsByPatient(id),
        fhirClient.getConditionsByPatient(id),
        fhirClient.getMedicationRequestsByPatient(id)
      ]);

      if (p) {
        setPatient(p);
        setObservations(obs);
        setConditions(conds);
        setMedications(meds);
        
        // Log access
        auditLogClient.log('READ', `Patient/${id}`, `Truy cập hồ sơ bệnh nhân ${p.name?.[0].text}`);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return <div className={styles.loading}>Đang tải hồ sơ bệnh nhân...</div>;
  if (!patient) return <div className={styles.error}>Không tìm thấy bệnh nhân.</div>;

  return (
    <main className={styles.main}>
      <Navbar />

      <div className="container" style={{ marginTop: '1.5rem' }}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={18} /> Quay lại danh sách
        </button>

        <section className={`${styles.patientHeader} glass animate-fade-in`}>
          <div className={styles.profileInfo}>
            <div className={styles.avatarLarge}>
              {patient.name?.[0].given?.[0]?.[0]}
            </div>
            <div className={styles.nameSection}>
              <h1>{patient.name?.[0].text}</h1>
              <div className={styles.badges}>
                <span className={styles.pid}>PID: {patient.identifier?.[0].value}</span>
                <span className={styles.gender}>{patient.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                <span className={styles.age}>{new Date().getFullYear() - new Date(patient.birthDate || '').getFullYear()} tuổi</span>
              </div>
            </div>
          </div>
          
          <div className={styles.quickStats}>
            <div className={styles.statBox}>
              <Activity size={20} color="var(--primary-color)" />
              <div>
                <p>Nhịp tim</p>
                <h3>{observations.find(o => o.code.text === 'Nhịp tim')?.valueQuantity?.value || '--'} <small>bpm</small></h3>
              </div>
            </div>
            <div className={styles.statBox}>
              <Thermometer size={20} color="var(--danger)" />
              <div>
                <p>Nhiệt độ</p>
                <h3>36.5 <small>°C</small></h3>
              </div>
            </div>
            <div className={styles.statBox}>
              <Droplets size={20} color="var(--info)" />
              <div>
                <p>Huyết áp</p>
                <h3>{observations.find(o => o.code.text === 'Huyết áp tâm thu')?.valueQuantity?.value || '--'}/80 <small>mmHg</small></h3>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.contentGrid}>
          <aside className={styles.sidebar}>
            <div className={styles.tabsVertical}>
              <button 
                className={activeTab === 'summary' ? styles.active : ''} 
                onClick={() => setActiveTab('summary')}
              >
                <FileText size={18} /> Tổng quan AI
              </button>
              <button 
                className={activeTab === 'vitals' ? styles.active : ''} 
                onClick={() => setActiveTab('vitals')}
              >
                <Activity size={18} /> Chỉ số sinh tồn
              </button>
              <button 
                className={activeTab === 'history' ? styles.active : ''} 
                onClick={() => setActiveTab('history')}
              >
                <Clock size={18} /> Lịch sử bệnh lý
              </button>
              <button 
                className={activeTab === 'prescribe' ? styles.active : ''} 
                onClick={() => setActiveTab('prescribe')}
              >
                <Pill size={18} /> Kê đơn AI/CDSS
              </button>
            </div>
            
            <div className={`${styles.allergiesCard} card`} style={{ marginTop: '1.5rem' }}>
              <div className={styles.cardHeader}>
                <AlertCircle size={18} color="var(--danger)" />
                <h4>Dị ứng & Cảnh báo</h4>
              </div>
              <ul className={styles.allergyList}>
                <li>- Penicillin (Phản ứng mạnh)</li>
                <li>- Phấn hoa (Viêm mũi)</li>
              </ul>
            </div >
          </aside>

          <section className={styles.mainContent}>
            {activeTab === 'summary' && (
              <div className="animate-fade-in">
                <AISummary patient={patient} conditions={conditions} observations={observations} />
                <div style={{ marginTop: '1.5rem' }}>
                  <CDSSAlert 
                    type="info" 
                    message="Bệnh nhân có lịch hẹn tái khám vào tuần tới." 
                    subMessage="Khoa Nội tiết - BS. Trần Hùng"
                  />
                </div>
                <VoiceToText onSave={(text) => console.log('Chẩn đoán mới:', text)} />
              </div>
            )}

            {activeTab === 'vitals' && (
              <div className="animate-fade-in">
                <VitalsChart />
                <div className={`${styles.statsTable} card`} style={{ marginTop: '1.5rem' }}>
                  <h3>Lịch sử đo gần đây</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Thời gian</th>
                        <th>Huyết áp</th>
                        <th>Nhịp tim</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {observations.map(obs => (
                        <tr key={obs.id}>
                          <td>{new Date(obs.effectiveDateTime || '').toLocaleString()}</td>
                          <td>{obs.code.text.includes('Huyết áp') ? `${obs.valueQuantity?.value}/80` : '--'}</td>
                          <td>{obs.code.text.includes('Nhịp tim') ? obs.valueQuantity?.value : '--'}</td>
                          <td>
                            <span className={obs.valueQuantity?.value && obs.valueQuantity.value > 100 ? 'status-abnormal' : 'status-normal'}>
                              {obs.valueQuantity?.value && obs.valueQuantity.value > 100 ? 'Bất thường' : 'Bình thường'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-fade-in">
                <h3>Các vấn đề sức khỏe (Conditions)</h3>
                <div className={styles.conditionList}>
                  {conditions.map(cond => (
                    <div key={cond.id} className={`${styles.conditionItem} card`}>
                      <div className={styles.condHeader}>
                        <h4>{cond.code.text}</h4>
                        <span className={styles.statusBadge}>{cond.clinicalStatus?.coding?.[0].display}</span>
                      </div>
                      <p className={styles.condDate}>Ghi nhận: {cond.recordedDate}</p>
                      <button className="btn btn-outline" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Chi tiết</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'prescribe' && (
              <div className="animate-fade-in">
                <div className="card">
                  <h3>Đơn thuốc hiện tại</h3>
                  <div className={styles.medicationList}>
                    {medications.map(med => (
                      <div key={med.id} className={styles.medItem}>
                        <div className={styles.medIcon}><Pill size={20} /></div>
                        <div className={styles.medInfo}>
                          <strong>{med.medicationCodeableConcept.text}</strong>
                          <p>{med.dosageInstruction?.[0].text}</p>
                        </div>
                        <span className={styles.medStatus}>{med.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ marginTop: '1.5rem' }}>
                  <h3>Kê đơn mới với AI/CDSS Check</h3>
                  <div className={styles.prescriptionTool}>
                    <input type="text" placeholder="Nhập tên thuốc..." className={styles.medInput} />
                    <button className="btn btn-primary">Kiểm tra tương tác & Thêm</button>
                  </div>
                  <div style={{ marginTop: '1rem' }}>
                    <CDSSAlert 
                      type="warning" 
                      message="Cảnh báo tương tác thuốc nhẹ" 
                      subMessage="Amoxicillin có thể làm giảm hiệu quả của một số loại thuốc khác." 
                    />
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
