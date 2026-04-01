import { Patient, Observation, Condition, MedicationRequest, Resource } from '../../types/fhir';

const FHIR_BASE_URL = process.env.NEXT_PUBLIC_FHIR_SERVER_URL || 'http://localhost:8090/fhir';

export const fhirClient = {
  getPatients: async (): Promise<Patient[]> => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/Patient?_sort=-_lastUpdated&_count=50`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      return (data.entry || []).map((entry: { resource: Patient }) => entry.resource);
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  },
  
  getPatientById: async (id: string): Promise<Patient | undefined> => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/Patient/${id}`);
      if (!response.ok) return undefined;
      return await response.json();
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      return undefined;
    }
  },
  
  getObservationsByPatient: async (patientId: string): Promise<Observation[]> => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/Observation?patient=${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch observations');
      const data = await response.json();
      return (data.entry || []).map((entry: { resource: Observation }) => entry.resource);
    } catch (error) {
      console.error(`Error fetching observations for patient ${patientId}:`, error);
      return [];
    }
  },
  
  getConditionsByPatient: async (patientId: string): Promise<Condition[]> => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/Condition?patient=${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch conditions');
      const data = await response.json();
      return (data.entry || []).map((entry: { resource: Condition }) => entry.resource);
    } catch (error) {
      console.error(`Error fetching conditions for patient ${patientId}:`, error);
      return [];
    }
  },
  
  getMedicationRequestsByPatient: async (patientId: string): Promise<MedicationRequest[]> => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/MedicationRequest?patient=${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch medication requests');
      const data = await response.json();
      return (data.entry || []).map((entry: { resource: MedicationRequest }) => entry.resource);
    } catch (error) {
      console.error(`Error fetching medications for patient ${patientId}:`, error);
      return [];
    }
  },

  createResource: async (resource: Omit<Resource, 'id'> & { id?: string }): Promise<Resource | null> => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/${resource.resourceType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/fhir+json',
        },
        body: JSON.stringify(resource),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('FHIR Server Error:', errorData);
        throw new Error('Failed to create resource');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating resource:', error);
      return null;
    }
  },

  testConnection: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${FHIR_BASE_URL}/metadata`, { 
        method: 'GET',
        headers: { 'Accept': 'application/fhir+json' }
      });
      if (response.ok) {
        return { success: true, message: 'Kết nối FHIR Server thành công' };
      }
      return { success: false, message: `Lỗi kết nối: ${response.status} ${response.statusText}` };
    } catch {
      return { success: false, message: 'Không thể kết nối đến máy chủ FHIR' };
    }
  }
};

