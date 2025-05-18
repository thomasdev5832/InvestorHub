export interface Migration {
  up(): Promise<void>;
  down(): Promise<void>;
  version: number;
  description: string;
} 