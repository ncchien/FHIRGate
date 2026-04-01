import { Patient, Observation, Condition, AllergyIntolerance } from '@/types/fhir';

export interface AISummaryResponse {
  summary: string;
  keyPoints: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export const clinicalAI = {
  summarizePatient: async (
    patient: Patient, 
    conditions: Condition[], 
    observations: Observation[]
  ): Promise<AISummaryResponse> => {
    return new Promise((resolve) => {
      const avgPulse = observations.find(o => o.code.text === 'Nhịp tim')?.valueQuantity?.value || 72;
      setTimeout(() => {
        resolve({
          summary: `Bệnh nhân ${patient.name?.[0].text} có tiền sử ${conditions.map(c => c.code.text).join(', ')}. Các chỉ số sinh tồn gần nhất cho thấy tình trạng ổn định, nhịp tim trung bình là ${avgPulse} bpm.`,
          keyPoints: [
            conditions.length > 0 ? 'Tiền sử bệnh lý cần lưu ý' : 'Không có tiền sử bệnh lý trọng yếu',
            avgPulse > 100 ? 'Nhịp tim hơi cao, cần theo dõi' : 'Dấu hiệu sinh tồn ổn định',
            'Đề xuất theo dõi định kỳ'
          ],
          riskLevel: avgPulse > 100 || conditions.length > 2 ? 'medium' : 'low'
        });
      }, 1500);
    });
  },

  checkPrescriptionSafety: async (
    medication: string,
    allergies: AllergyIntolerance[]
  ): Promise<{ safe: boolean; warning?: string }> => {
    const isAllergic = allergies.some(a => 
      medication.toLowerCase().includes(a.code.text.toLowerCase())
    );

    if (isAllergic) {
      return {
        safe: false,
        warning: `Cảnh báo: Bệnh nhân có tiền sử dị ứng với các thành phần trong ${medication}.`
      };
    }

    return { safe: true };
  }
};
