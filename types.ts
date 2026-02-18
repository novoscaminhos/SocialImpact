export interface TriageResult {
  destination: string;
  justification: string;
  address_contact: string;
  procedures: string[];
  severity_level: 'low' | 'medium' | 'high';
}

export interface HistoryItem extends TriageResult {
  id: string;
  timestamp: number;
  original_query: string;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}