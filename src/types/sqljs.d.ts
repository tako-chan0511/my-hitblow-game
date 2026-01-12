declare module "sql.js" {
  export interface Statement {
    bind(values?: any[] | Record<string, any>): void;
    step(): boolean;
    getAsObject(params?: any[] | Record<string, any>): Record<string, any>;
    // ★ 追加
    run(values?: any[] | Record<string, any>): void;
    free(): void;
  }

  export class Database {
    exec(sql: string, params?: any[] | Record<string, any>): any[];
    run(sql: string, params?: any[] | Record<string, any>): void;

    // ★ これが今回必要
    prepare(sql: string, params?: any[] | Record<string, any>): Statement;

    export(): Uint8Array;
    close(): void;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => Database;
  }

  export interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(config?: InitSqlJsConfig): Promise<SqlJsStatic>;
}
