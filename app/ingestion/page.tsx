'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Upload, FileText, CheckCircle, Brain, Database, ArrowRight, Info, Loader2 } from 'lucide-react';
import styles from './ingestion.module.css';
import { fhirClient } from '@/lib/fhir/fhirClient';

export default function IngestionPage() {
  const [step, setStep] = useState(1);
  const [fileType, setFileType] = useState<'pdf' | 'excel'>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mappedData, setMappedData] = useState<Record<string, any> | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>(['Patient Name', 'Systolic', 'Diastolic', 'Pulse', 'Date']);
  const [mapping, setMapping] = useState<Record<string, string>>({
    'Observation.subject': 'Patient Name',
    'Observation.value': 'Systolic',
    'Observation.effectiveDateTime': 'Date'
  });

  const handleUpload = (type: 'pdf' | 'excel') => {
    setFileType(type);
    setIsProcessing(true);
    // Simulate OCR + AI Mapping
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
      if (type === 'pdf') {
        setMappedData({
          resourceType: 'Observation',
          code: 'Huyết áp',
          value: 125,
          unit: 'mmHg',
          patient: 'Nguyễn Văn A',
          confidence: 0.98,
          fallback: false
        });
      } else {
        setMappedData({
          resourceType: 'Bundle',
          type: 'collection',
          entry: [
            { resourceType: 'Observation', code: 'Huyết áp', value: 120 }
          ],
          confidence: 1.0,
          fallback: false
        });
      }
    }, 2500);
  };

  const handleConfirm = async () => {
    if (!mappedData) return;
    
    setIsProcessing(true);
    try {
      // Create a valid FHIR Observation from the mapped data
      const resource = {
        resourceType: 'Observation' as const,
        status: 'final' as const,
        code: {
          coding: [{ 
            system: 'http://loinc.org', 
            code: fileType === 'pdf' ? '85354-9' : '12345-6', 
            display: mappedData.code 
          }],
          text: mappedData.code
        },
        subject: { 
          // In a real app, we'd search for the patient by name or ID
          // For the demo, we use a placeholder or the first patient found
          reference: 'Patient/example' 
        },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
          value: mappedData.value || 120,
          unit: mappedData.unit || 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]'
        }
      };
      
      const result = await fhirClient.createResource(resource);
      if (result) {
        setStep(3);
      } else {
        alert('Lỗi khi kết nối FHIR Server. Vui lòng đảm bảo Docker đang chạy trên port 8090.');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Đã xảy ra lỗi khi lưu dữ liệu.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className={styles.main}>
      <Navbar />
      
      <div className="container" style={{ marginTop: '2rem', maxWidth: '800px' }}>
        <header className={styles.header}>
          <h1>Tiếp nhận Dữ liệu Đa nguồn</h1>
          <p>Tự động cấu trúc hóa PDF, Hình ảnh và Excel sang chuẩn HL7 FHIR R4</p>
        </header>

        <div className={styles.stepper}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>1. Tải lên</div>
          <div className={styles.connector}></div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>2. AI Phân tách</div>
          <div className={styles.connector}></div>
          <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>3. Lưu FHIR Server</div>
        </div>

        {step === 1 && (
          <div className={`${styles.uploadGrid} animate-fade-in`}>
            <div className={`${styles.uploadZone} card`} onClick={() => handleUpload('pdf')}>
              {isProcessing && fileType === 'pdf' ? (
                <div className={styles.processing}>
                  <Brain className={styles.brainIcon} size={48} />
                  <h3>AI đang bóc tách PDF...</h3>
                  <p>Đang chạy OCR (Tesseract/LLM) và NER...</p>
                  <div className={styles.progressBar}><div className={styles.progressFill}></div></div>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <div className={styles.iconCircle}><FileText size={32} /></div>
                  <h3>Tải lên PDF / Hình ảnh</h3>
                  <p>Kết quả xét nghiệm, Sổ khám bệnh (OCR tự động)</p>
                  <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Chọn File</button>
                </div>
              )}
            </div>

            <div className={`${styles.uploadZone} card`} onClick={() => handleUpload('excel')}>
              {isProcessing && fileType === 'excel' ? (
                <div className={styles.processing}>
                  <Database className={styles.brainIcon} size={48} />
                  <h3>Đang phân tích Excel...</h3>
                  <p>Đang đọc cấu trúc bảng và gợi ý mapping...</p>
                  <div className={styles.progressBar}><div className={styles.progressFill}></div></div>
                </div>
              ) : (
                <div className={styles.uploadPrompt}>
                  <div className={styles.iconCircle}><Upload size={32} /></div>
                  <h3>Tải lên Excel / CSV</h3>
                  <p>Dữ liệu quy mô lớn, hỗ trợ ánh xạ động (Dynamic Mapping)</p>
                  <button className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Chọn File</button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && mappedData && (
          <div className="animate-fade-in">
            <div className="card">
              <div className={styles.mappingHeader}>
                <CheckCircle size={24} color="var(--secondary-color)" />
                <div>
                  <h3>Kiểm tra & Ánh xạ Dữ liệu (FHIR Mapping)</h3>
                  <p>{fileType === 'pdf' ? 'Kết quả bóc tách từ AI (OCR/NER)' : 'Vui lòng xác nhận ánh xạ các cột Excel'}</p>
                </div>
              </div>

              {fileType === 'pdf' ? (
                <div className={styles.mappingTable}>
                  <div className={styles.mappingRow}>
                    <span>Trường FHIR (Target)</span>
                    <span>Giá trị trích xuất (Source)</span>
                    <span>Độ tin cậy</span>
                  </div>
                  <div className={styles.mappingRow}>
                    <strong>Observation.code</strong>
                    <span className={styles.tag}>{mappedData.code}</span>
                    <span className={styles.confidence}>99%</span>
                  </div>
                  <div className={styles.mappingRow}>
                    <strong>Observation.value</strong>
                    <span className={styles.tag}>{mappedData.value} {mappedData.unit}</span>
                    <span className={styles.confidence}>95%</span>
                  </div>
                  <div className={styles.mappingRow}>
                    <strong>Observation.subject</strong>
                    <span className={styles.tag}>{mappedData.patient}</span>
                    <span className={styles.confidence}>98%</span>
                  </div>
                </div>
              ) : (
                <div className={styles.excelMapping}>
                  <div className={styles.mappingRow}>
                    <span>FHIR Resource Field</span>
                    <span>Excel Column Mapping</span>
                  </div>
                  {Object.keys(mapping).map(field => (
                    <div key={field} className={styles.mappingRow}>
                      <strong>{field}</strong>
                      <select 
                        value={mapping[field]} 
                        onChange={(e) => setMapping({...mapping, [field]: e.target.value})}
                        className={styles.select}
                      >
                        {excelColumns.map(col => <option key={col} value={col}>{col}</option>)}
                      </select>
                    </div>
                  ))}
                  <div className={styles.mappingInfo}>
                    <Info size={16} />
                    <span>Hệ thống tự động chuyển đổi các biến thể (ví dụ: &quot;Nam&quot;, &quot;M&quot; thành &quot;male&quot;) theo HL7 FHIR Standard.</span>
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>Hủy bỏ</button>
                {mappedData.confidence < 0.8 && (
                  <button className="btn btn-outline" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
                    Chuyển Fallback DocumentReference
                  </button>
                )}
                <button className="btn btn-primary" onClick={handleConfirm} disabled={isProcessing}>
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" size={18} /> Đang lưu...</>
                  ) : (
                    <><Database size={18} /> Lưu vào FHIR Server <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={`${styles.successCard} card animate-fade-in`}>
            <div className={styles.successIcon}><Database size={48} /></div>
            <h2>Đã đẩy dữ liệu thành công!</h2>
            <p>Hồ sơ đã được mã hóa AES-256 và lưu trữ an toàn trên máy chủ HL7 FHIR R4.</p>
            <div className={styles.auditNote}>
              <CheckCircle size={14} /> Ghi nhận Audit Log: [CREATE] DocumentReference/Observation by BS. Nguyễn Quân
            </div>
            <button className="btn btn-primary" onClick={() => setStep(1)} style={{ marginTop: '2rem' }}>
              Tiếp tục tải lên file khác
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
