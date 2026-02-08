import dbClient from "../db/client";

export interface LogEntry {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: Record<string, unknown>;
}

export class Logger {
  private log(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString();
    const contextJson = context ? JSON.stringify(context) : null;

    dbClient.run(
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
