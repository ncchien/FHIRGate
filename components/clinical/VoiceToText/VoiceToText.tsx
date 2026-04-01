'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Save, X } from 'lucide-react';
import styles from './VoiceToText.module.css';

interface VoiceToTextProps {
  onSave: (text: string) => void;
  language?: 'vi-VN' | 'en-US';
}

export default function VoiceToText({ onSave, language = 'vi-VN' }: VoiceToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser support
    if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).WebkitSpeechRecognition || (window as any).speechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
    setIsListening(!isListening);
  };

  return (
    <div className={`${styles.container} glass animate-fade-in`}>
      <div className={styles.header}>
        <h3>Nhập liệu bằng Giọng nói (AI)</h3>
        <p>Hỗ trợ bác sĩ ghi chép chẩn đoán nhanh chóng</p>
      </div>

      <div className={styles.textareaWrapper}>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Giọng nói của bác sĩ sẽ được chuyển đổi thành văn bản tại đây..."
          className={styles.textarea}
        />
        {isListening && <div className={styles.listeningIndicator}><span className={styles.dot}></span> Đang nghe...</div>}
      </div>

      <div className={styles.actions}>
        <button 
          onClick={toggleListening} 
          className={`${styles.micBtn} ${isListening ? styles.active : ''}`}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          {isListening ? 'Dừng' : 'Bắt đầu nói'}
        </button>

        <div className={styles.rightActions}>
          <button onClick={() => setTranscript('')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
            <X size={16} /> Xóa
          </button>
          <button 
            onClick={() => { onSave(transcript); setTranscript(''); }} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1rem' }}
            disabled={!transcript.trim()}
          >
            <Save size={16} /> Lưu vào hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
}
