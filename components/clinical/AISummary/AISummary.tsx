'use client';

import { useState, useEffect } from 'react';
import { Patient, Condition, Observation } from '@/types/fhir';
import { clinicalAI, AISummaryResponse } from '@/lib/ai/clinicalAI';
import styles from './AISummary.module.css';

interface AISummaryProps {
  patient: Patient;
  conditions: Condition[];
  observations: Observation[];
}

export default function AISummary({ patient, conditions, observations }: AISummaryProps) {
  const [data, setData] = useState<AISummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateSummary = async () => {
      setLoading(true);
      const response = await clinicalAI.summarizePatient(patient, conditions, observations);
      setData(response);
      setLoading(false);
    };
    generateSummary();
  }, [patient, conditions, observations]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'var(--danger)';
      case 'medium': return 'var(--warning)';
      default: return 'var(--secondary-color)';
    }
  };

  return (
    <div className={`${styles.container} glass animate-fade-in`}>
      <div className={styles.header}>
        <div className={styles.aiBadge}>AI Summary</div>
        <h3>Tóm tắt Bệnh án (Tự động)</h3>
      </div>
      
      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>AI đang phân tích hàng chục trang hồ sơ...</p>
        </div>
      ) : data && (
        <div className={styles.content}>
          <div className={styles.summaryText}>
            <p>{data.summary}</p>
          </div>
          
          <div className={styles.keyPoints}>
            <h4>Điểm tin cậy chính:</h4>
            <ul>
              {data.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          <div className={styles.footer}>
            <div className={styles.riskInfo}>
              <span>Mức độ rủi ro: </span>
              <strong style={{ color: getRiskColor(data.riskLevel) }}>
                {data.riskLevel.toUpperCase()}
              </strong>
            </div>
            <div className={styles.meta}>
              Dựa trên {observations.length} Observations, {conditions.length} Conditions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
