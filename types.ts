export interface AnalysisResult {
  sentiment: string;
  imagePrompt: string;
  insight: string;
  colors: string[];
}

export interface JournalState {
  step: 'intro' | 'writing' | 'processing' | 'result';
  entry: string;
  analysis: AnalysisResult | null;
  generatedImageBase64: string | null;
  error: string | null;
}

export enum Theme {
  Dark = 'dark',
  Light = 'light'
}