export type ResourceType = 
  | 'Patient' 
  | 'Observation' 
  | 'Condition' 
  | 'Encounter' 
  | 'MedicationRequest' 
  | 'DiagnosticReport' 
  | 'AllergyIntolerance'
  | 'DocumentReference';

export interface Resource {
  resourceType: ResourceType;
  id: string;
}

export interface Patient extends Resource {
  resourceType: 'Patient';
  identifier?: { system: string; value: string }[];
  name?: { text: string; family?: string; given?: string[] }[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  telecom?: { system: string; value: string }[];
}

export interface Observation extends Resource {
  resourceType: 'Observation';
  status: 'final' | 'preliminary';
  category?: { coding: { system: string; code: string; display: string }[] }[];
  code: { coding: { system: string; code: string; display: string }[]; text: string };
  subject: { reference: string };
  effectiveDateTime?: string;
  valueQuantity?: { value: number; unit: string; system?: string; code?: string };
  interpretation?: { coding: { system: string; code: string; display: string }[] }[];
}

export interface Condition extends Resource {
  resourceType: 'Condition';
  clinicalStatus?: { coding: { code: string; display: string }[] };
  code: { text: string };
  subject: { reference: string };
  recordedDate?: string;
}

export interface MedicationRequest extends Resource {
  resourceType: 'MedicationRequest';
  status: 'active' | 'completed';
  subject: { reference: string };
  medicationCodeableConcept: { text: string };
  authoredOn?: string;
  dosageInstruction?: { text: string }[];
}

export interface Encounter extends Resource {
  resourceType: 'Encounter';
  status: 'finished' | 'planned';
  class: { display: string };
  subject: { reference: string };
  period?: { start: string; end?: string };
}

export interface AllergyIntolerance extends Resource {
  resourceType: 'AllergyIntolerance';
  code: { text: string };
  patient: { reference: string };
}

export interface DiagnosticReport extends Resource {
  resourceType: 'DiagnosticReport';
  status: 'final' | 'preliminary';
  code: { text: string };
  subject: { reference: string };
  issued?: string;
  result?: { reference: string; display?: string }[];
}

export interface DocumentReference extends Resource {
  resourceType: 'DocumentReference';
  status: 'current' | 'superseded';
  subject: { reference: string };
  content: { attachment: { url?: string; contentType?: string; title?: string } }[];
}
