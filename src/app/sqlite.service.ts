import { Injectable } from '@angular/core';

import { Plugins } from '@capacitor/core';
import * as CapacitorSQLPlugin from 'capacitor-sqlite';
import { BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { capSQLiteOptions, capSQLiteResult } from 'capacitor-sqlite';
const { CapacitorSQLite } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqlite: CapacitorSQLPlugin.CapacitorSQLitePlugin;
  private dbName = 'bico';

  private ready$ = new BehaviorSubject<boolean>(false);

  constructor(
    private platform: Platform
  ) {}

  async init() {
    if (this.platform.is('ios') || this.platform.is('android') ) {
      this.setSqlite(CapacitorSQLite);
    } else if (this.platform.is('electron')) {
      this.setSqlite(CapacitorSQLPlugin.CapacitorSQLiteElectron);
    } else {
      this.setSqlite(CapacitorSQLPlugin.CapacitorSQLite);
    }

    this.openDatabase();
  }

  private setSqlite(sqlite) {
    this.sqlite = sqlite;
    this.ready$.next(true);
  }

  private async openDatabase() {
    const response: any = await this.sqlite.open({database: this.dbName});
    console.log('OPEN DB Database', response);
    const retOpenDB = response.result;

    if (!retOpenDB) {
      console.error('Database could not be opened', response);
      throw new Error('Database could not be opened');
    }
  }

  async execute(query: capSQLiteOptions): Promise<capSQLiteResult> {
    await this.waitForReady();
    console.debug('SQL EXECUTE:', query);

    return await this.sqlite.execute(query);
  }

  async query(query: capSQLiteOptions): Promise<capSQLiteResult> {
    await this.waitForReady();
    console.debug('SQL QUERY:', query);

    return await this.sqlite.query(query);
  }

  async run(query: capSQLiteOptions): Promise<capSQLiteResult> {
    await this.waitForReady();
    console.debug('SQL QUERY:', query);

    return await this.sqlite.query(query);
  }

  private validateQuery(query: capSQLiteOptions): boolean {
    const countOfPlaceholders = (query.statement.match(/\?/g) || []).length;

    return query.values.length === countOfPlaceholders;
  }

  private async waitForReady() {
    return new Promise((resolve) => {
      this.ready$
        .pipe(
          filter(state => !!state)
        )
        .subscribe(() => {
          resolve();
        });
    });
  }

  private transformQuery(query): capSQLiteOptions {
    const statement = `
      BEGIN TRANSACTION;
      ${query.statement};
      COMMIT TRANSACTION;
    `;

    return {
      statement,
      values: query.values
    };
  }
}
