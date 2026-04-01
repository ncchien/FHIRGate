import { Patient, Observation, Condition, MedicationRequest, Encounter } from '../../types/fhir';

export const mockPatients: Patient[] = [
  {
    resourceType: 'Patient',
    id: 'pat-001',
    identifier: [{ system: 'https://vtm.gov.vn/pid', value: '123456789' }],
    name: [{ text: 'Nguyễn Văn A', family: 'Nguyễn', given: ['Văn', 'A'] }],
    gender: 'male',
    birthDate: '1985-05-20',
    telecom: [{ system: 'phone', value: '0901234567' }]
  },
  {
    resourceType: 'Patient',
    id: 'pat-002',
    identifier: [{ system: 'https://vtm.gov.vn/pid', value: '987654321' }],
    name: [{ text: 'Trần Thị B', family: 'Trần', given: ['Thị', 'B'] }],
    gender: 'female',
    birthDate: '1992-11-12',
    telecom: [{ system: 'phone', value: '0912345678' }]
  }
];

export const mockEncounters: Encounter[] = [
  {
    resourceType: 'Encounter',
    id: 'enc-001',
    status: 'finished',
    class: { display: 'Inpatient' },
    subject: { reference: 'Patient/pat-001' },
    period: { start: '2026-03-25T08:00:00Z', end: '2026-03-30T10:00:00Z' }
  }
];

export const mockObservations: Observation[] = [
  {
    resourceType: 'Observation',
    id: 'obs-001',
    status: 'final',
    code: { text: 'Huyết áp tâm thu', coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
    subject: { reference: 'Patient/pat-001' },
    effectiveDateTime: '2026-03-30T09:00:00Z',
    valueQuantity: { value: 125, unit: 'mmHg' },
    interpretation: [{ coding: [{ system: 'http://hl7.org/fhir/v2/0078', code: 'N', display: 'Normal' }] }]
  },
  {
    resourceType: 'Observation',
    id: 'obs-002',
    status: 'final',
    code: { text: 'Nhịp tim', coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
    subject: { reference: 'Patient/pat-001' },
    effectiveDateTime: '2026-03-30T09:05:00Z',
    valueQuantity: { value: 102, unit: 'bpm' },
    interpretation: [{ coding: [{ system: 'http://hl7.org/fhir/v2/0078', code: 'H', display: 'High' }] }]
  }
];

export const mockConditions: Condition[] = [
  {
    resourceType: 'Condition',
    id: 'cond-001',
    clinicalStatus: { coding: [{ code: 'active', display: 'Đang điều trị' }] },
    code: { text: 'Viêm phổi cộng đồng' },
    subject: { reference: 'Patient/pat-001' },
    recordedDate: '2026-03-25'
  }
];

export const mockMedications: MedicationRequest[] = [
  {
    resourceType: 'MedicationRequest',
    id: 'med-001',
    status: 'active',
    subject: { reference: 'Patient/pat-001' },
    medicationCodeableConcept: { text: 'Amoxicillin 500mg' },
    authoredOn: '2026-03-25',
    dosageInstruction: [{ text: 'Uống 1 viên / lần, 3 lần / ngày' }]
  }
];
