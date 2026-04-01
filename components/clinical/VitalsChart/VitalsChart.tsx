'use client';

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import styles from './VitalsChart.module.css';

const data = [
  { time: '08:00', bloodPressure: 120, heartRate: 72 },
  { time: '10:00', bloodPressure: 125, heartRate: 78 },
  { time: '12:00', bloodPressure: 118, heartRate: 75 },
  { time: '14:00', bloodPressure: 130, heartRate: 85 },
  { time: '16:00', bloodPressure: 128, heartRate: 98 },
  { time: '18:00', bloodPressure: 125, heartRate: 102 },
];

export default function VitalsChart() {
  return (
    <div className={`${styles.chartContainer} card`}>
      <h3 className={styles.title}>Biểu đồ Xu hướng Sinh tồn</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: 'var(--radius)', 
                border: 'none', 
                boxShadow: 'var(--shadow)',
                background: 'rgba(255, 255, 255, 0.9)'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="bloodPressure" 
              stroke="var(--primary-color)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBp)" 
              name="Huyết áp"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dotBp}></span> Huyết áp (mmHg)
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotHr}></span> Nhịp tim (bpm)
        </div>
      </div>
    </div>
  );
}
