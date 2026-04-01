'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Users, Clock, Pill, Activity, TrendingUp, Filter, Download, Calendar, ShieldCheck } from 'lucide-react';
import styles from './dashboard.module.css';
import { auditLogClient, AuditLog } from '@/lib/audit/auditLogClient';
import { fhirClient } from '@/lib/fhir/fhirClient';
import { useEffect } from 'react';

const patientData = [
  { name: 'T2', count: 45, inpatient: 12, outpatient: 33 },
  { name: 'T3', count: 52, inpatient: 15, outpatient: 37 },
  { name: 'T4', count: 48, inpatient: 10, outpatient: 38 },
  { name: 'T5', count: 61, inpatient: 18, outpatient: 43 },
  { name: 'T6', count: 55, inpatient: 20, outpatient: 35 },
  { name: 'T7', count: 32, inpatient: 8, outpatient: 24 },
  { name: 'CN', count: 18, inpatient: 5, outpatient: 13 },
];

const diseaseData = [
  { name: 'Viêm phổi', value: 35, color: '#0ea5e9' },
  { name: 'Tiểu đường', value: 25, color: '#10b981' },
  { name: 'Tim mạch', value: 20, color: '#f59e0b' },
  { name: 'Khác', value: 20, color: '#8b5cf6' },
];

const medicationTrends = [
  { month: 'Jan', cost: 4500, usage: 120 },
  { month: 'Feb', cost: 5200, usage: 140 },
  { month: 'Mar', cost: 4800, usage: 135 },
  { month: 'Apr', cost: 6100, usage: 160 },
];

const clinicalTrends = [
  { day: '01/03', glucose: 110, bp: 120 },
  { day: '05/03', glucose: 105, bp: 125 },
  { day: '10/03', glucose: 115, bp: 118 },
  { day: '15/03', glucose: 120, bp: 130 },
  { day: '20/03', glucose: 118, bp: 128 },
  { day: '25/03', glucose: 112, bp: 125 },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'epi' | 'med' | 'clinical'>('epi');
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [fhirStatus, setFhirStatus] = useState<{ success: boolean; message: string }>({ success: false, message: 'Đang kiểm tra...' });
  const [counts, setCounts] = useState({ patients: 0, observations: 0, conditions: 0, medications: 0 });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch Audit Logs
      const auditData = await auditLogClient.getLogs();
      setLogs(auditData);

      // Check FHIR Connection
      try {
        const status = await fhirClient.testConnection();
        setFhirStatus(status);

        if (status.success) {
          const patients = await fhirClient.getPatients();
          setCounts({
            patients: patients.length,
            observations: 28, // Mock or fetch
            conditions: 15,   // Mock or fetch
            medications: 10   // Mock or fetch
          });
        }
      } catch {
        setFhirStatus({ success: false, message: 'Lỗi kết nối FHIR' });
      }
    };
    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className="container" style={{ marginTop: '2rem' }}>
        <header className={styles.dashboardHeader}>
          <div>
            <h1>Bảng điều khiển Quản lý FHIRGate</h1>
            <p>Hệ thống giám sát dịch tễ và vận hành bệnh viện thời gian thực</p>
            <div className={`${styles.statusBadge} ${fhirStatus.success ? styles.statusSuccess : styles.statusError}`}>
              <Activity size={14} /> {fhirStatus.message}
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <div className={styles.filterGroup}>
              <Calendar size={18} />
              <select className={styles.select}>
                <option>30 ngày qua</option>
                <option>Tuần này</option>
                <option>Tháng này</option>
              </select>
            </div>
            <button className={`${styles.filterBtn} btn btn-outline`}>
              <Filter size={18} /> Lọc Khoa/Phòng
            </button>
            <button className={`${styles.exportBtn} btn btn-primary`}>
              <Download size={18} /> Xuất báo cáo
            </button>
          </div>
        </header>

        <section className={styles.statsGrid}>
          <div className={`${styles.statsCard} card animate-fade-in`}>
            <div className={styles.statsIcon} style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
              <Users size={24} />
            </div>
            <div className={styles.statsInfo}>
              <p>Tổng số Bệnh nhân</p>
              <h3>{fhirStatus.success ? counts.patients : '1,402'}</h3>
              <span className={styles.trendUp}><TrendingUp size={14} /> {fhirStatus.success ? 'Real-time' : '+15.2%'}</span>
            </div>
          </div>

          <div className={`${styles.statsCard} card animate-fade-in`} style={{ animationDelay: '0.1s' }}>
            <div className={styles.statsIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Activity size={24} />
            </div>
            <div className={styles.statsInfo}>
              <p>Hiệu suất giường</p>
              <h3>88.5%</h3>
              <span className={styles.trendUp}>+2.1%</span>
            </div>
          </div>

          <div className={`${styles.statsCard} card animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            <div className={styles.statsIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Pill size={24} />
            </div>
            <div className={styles.statsInfo}>
              <p>MedicationRequest mới</p>
              <h3>284</h3>
              <span className={styles.trendUp}>+0.5%</span>
            </div>
          </div>

          <div className={`${styles.statsCard} card animate-fade-in`} style={{ animationDelay: '0.3s' }}>
            <div className={styles.statsIcon} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Clock size={24} />
            </div>
            <div className={styles.statsInfo}>
              <p>Giảm thời gian chờ</p>
              <h3>-18.4%</h3>
              <span className={styles.trendDown}>Cải thiện</span>
            </div>
          </div>
        </section>

        <div className={styles.tabSection}>
          <div className={styles.tabs}>
            <button className={activeTab === 'epi' ? styles.activeTab : ''} onClick={() => setActiveTab('epi')}>Dịch tễ & Hoạt động</button>
            <button className={activeTab === 'med' ? styles.activeTab : ''} onClick={() => setActiveTab('med')}>Quản lý Sử dụng Thuốc</button>
            <button className={activeTab === 'clinical' ? styles.activeTab : ''} onClick={() => setActiveTab('clinical')}>Lâm sàng Cộng đồng</button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'epi' && (
              <div className={styles.chartsGrid}>
                <div className="card animate-fade-in">
                  <h3 className={styles.chartTitle}>Lưu lượng Nội/Ngoại trú</h3>
                  <div style={{ height: '350px', marginTop: '1.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={patientData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 'var(--radius)', border: 'none', boxShadow: 'var(--shadow)' }} />
                        <Bar dataKey="inpatient" stackId="a" fill="var(--primary-color)" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="outpatient" stackId="a" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card animate-fade-in">
                  <h3 className={styles.chartTitle}>Cơ cấu Mặt bệnh (Condition)</h3>
                  <div style={{ height: '350px', marginTop: '1.5rem', display: 'flex', alignItems: 'center' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={diseaseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {diseaseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className={styles.pieLegend}>
                      {diseaseData.map((item, idx) => (
                        <div key={idx} className={styles.pieLegendItem}>
                          <span style={{ background: item.color }}></span>
                          <p>{item.name}: <strong>{item.value}%</strong></p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'med' && (
              <div className={styles.chartsGrid}>
                <div className="card animate-fade-in">
                  <h3 className={styles.chartTitle}>Xu hướng Chi phí & Sử dụng thuốc</h3>
                  <div style={{ height: '350px', marginTop: '1.5rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={medicationTrends}>
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="cost" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorCost)" />
                        <Area type="monotone" dataKey="usage" stroke="var(--secondary-color)" fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card animate-fade-in">
                  <h3 className={styles.chartTitle}>Thuốc kê đơn nhiều nhất</h3>
                  <div className={styles.medRankList}>
                    {[
                      { name: 'Paracetamol', count: 450, cost: '4.5M' },
                      { name: 'Amoxicillin', count: 320, cost: '12.8M' },
                      { name: 'Amlodipine', count: 280, cost: '8.4M' },
                      { name: 'Metformin', count: 190, cost: '5.7M' },
                    ].map((med, i) => (
                      <div key={i} className={styles.medRankItem}>
                        <div className={styles.rankNum}>{i+1}</div>
                        <div className={styles.rankInfo}>
                          <strong>{med.name}</strong>
                          <span>{med.count} lượt kê</span>
                        </div>
                        <div className={styles.rankCost}>{med.cost}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'clinical' && (
              <div className="card animate-fade-in">
                <h3 className={styles.chartTitle}>Xu hướng Lâm sàng (Observations cộng đồng)</h3>
                <div style={{ height: '400px', marginTop: '1.5rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={clinicalTrends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="glucose" stroke="var(--primary-color)" strokeWidth={3} dot={{ r: 6 }} />
                      <Line type="monotone" dataKey="bp" stroke="var(--danger)" strokeWidth={3} dot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.chartNote}>
                  <TrendingUp size={16} /> Biểu đồ thể hiện mức đường huyết (Glucose) và Huyết áp tâm thu (Systolic BP) trung bình của nhóm bệnh nhân mạn tính.
                </div>
              </div>
            )}
          </div>
        </div>
        <section className={styles.auditSection}>
          <div className="card animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className={styles.cardHeader}>
              <ShieldCheck size={20} color="var(--primary-color)" />
              <h3>Nhật ký Kiểm toán (Audit Trail)</h3>
            </div>
            <div className={styles.logTableWrapper}>
              <table className={styles.logTable}>
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Người dùng</th>
                    <th>Hành động</th>
                    <th>Tài nguyên</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? logs.map((log, index) => (
                    <tr key={index}>
                      <td className={styles.timestamp}>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.user}</td>
                      <td><span className={`${styles.actionBadge} ${styles[log.action]}`}>{log.action}</span></td>
                      <td>{log.resource}</td>
                      <td className={styles.details}>{log.details}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có nhật ký hoạt động nào</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
