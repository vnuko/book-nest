export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogProfile = 'DEVELOPMENT' | 'PRODUCTION';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerOptions {
  profile: LogProfile;
  logDir: string;
  batchId?: string;
}
