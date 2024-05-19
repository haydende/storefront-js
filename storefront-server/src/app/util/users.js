import { Database } from './database.js'

export class UserService {

    sql;

    constructor() {
       this.sql = Database.createConnection();
    }

    async getUsersWithFirstNameLike(firstName) {
        const users = await this.sql`
            SELECT *
            FROM Users
            WHERE first_name like ${firstName}
        `;

        return users;
    }

}
