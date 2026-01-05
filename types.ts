
export enum SearchMode {
  GENERAL = 'general',
  IMAGE = 'image',
  VIDEO = 'video'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchResult {
  id: string;
  type: SearchMode;
  query: string;
  content?: string;
  mediaUrl?: string;
  sources?: GroundingSource[];
  timestamp: number;
}

export interface GenerationState {
  isGenerating: boolean;
  statusMessage: string;
  progress?: number;
}
