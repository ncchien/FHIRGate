export type AuditAction = 'READ' | 'WRITE' | 'DELETE' | 'SEARCH' | 'LOGIN';

export interface AuditLog {
  timestamp: string;
  user: string;
  action: AuditAction;
  resource: string;
  details?: string;
}

const STORAGE_KEY = 'fhirgate_audit_logs';

export const auditLogClient = {
  log: async (action: AuditAction, resource: string, details?: string) => {
    const logsStr = localStorage.getItem(STORAGE_KEY) || '[]';
    const logs: AuditLog[] = JSON.parse(logsStr);
    
    const newEntry: AuditLog = {
      timestamp: new Date().toISOString(),
      user: 'BS. Nguyễn Quân',
      action,
      resource,
      details
    };
    
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.slice(0, 100))); // Keep last 100 logs
    
    console.log(`[AUDIT] ${newEntry.action} on ${newEntry.resource}: ${details || ''}`);
  },
  
  getLogs: async (): Promise<AuditLog[]> => {
    const logsStr = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(logsStr);
  }
};
