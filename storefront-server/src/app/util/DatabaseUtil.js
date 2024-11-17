import postgres from "postgres";

export class DatabaseUtil {

    static sql;

    static createConnection() {
        if (!this.sql) {

            console.debug(`${new Date()} - Creating connection to Postgres host: ${process.env.PGHOST}:${process.env.PGPORT}`);
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
