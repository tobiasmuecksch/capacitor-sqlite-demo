import { Component } from '@angular/core';
import { SqliteService } from '../sqlite.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(
    private sql: SqliteService
  ) {}

  async testSqlite() {
    const statement = `
    BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS "myTable" (
			"_id"	TEXT,
			"Type"	TEXT,
			"Title"	TEXT
			PRIMARY KEY("_id")
    );
    COMMIT TRANSACTION;`;

    await this.sql.init();
    const result = await this.sql.run({statement, values: []});

    console.log('RESULT', result);

    const selectStatement = 'SELECT * FROM conversation';

    const result1 = await this.sql.query({statement: selectStatement, values: []});

    console.log('SELECT result (should be empty)', result1);

    const insertStatement = `BEGIN TRANSACTION; INSERT INTO conversation (_id,Title) VALUES (?,?); PRAGMA user_version = 1; COMMIT TRANSACTION;`;

    const result2 = await this.sql.query({statement: insertStatement, values: ['1234', 'Titel für 1234']});
    const result3 = await this.sql.query({statement: insertStatement, values: ['4321', 'Titel für 4321']});

    console.log('RESULTS', result2, result3);


    const result4 = await this.sql.query({statement: selectStatement, values: []});
    console.log('SELECT 2 RESULTS (should have two results)', result4);
  }

}
