import { Database } from 'bun:sqlite';

export interface LogEntry {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private db: Database;

  constructor(dbPath: string = 'logs.db') {
    this.db = new Database(dbPath);
  }

  private log(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    const contextJson = context ? JSON.stringify(context) : null;

    this.db.run(
      `INSERT INTO logs (timestamp, level, message, context)
       VALUES (?, ?, ?, ?)`,
      [timestamp, level, message, contextJson]
    );
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('WARN', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('ERROR', message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('DEBUG', message, context);
  }
}
