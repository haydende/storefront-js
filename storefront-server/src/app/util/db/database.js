import postgres from "postgres";

export class Database {

    static sql;

    static createConnection() {
        if (!this.sql) {
            this.sql = postgres({
                username: process.env.PGUSERNAME,
                password: process.env.PGPASSWORD,
                database: process.env.PGDATABASE,
                host: process.env.PGHOST,
                port: process.env.PGPORT
            })
        }
        return this.sql;
    }
}
