import { Database } from './database.js'

export class UserService {

    sql;

    constructor() {
       this.sql = Database.createConnection();
    }

    async getUsersWithFirstNameLike(firstName) {
        return await this.sql`
            SELECT *
            FROM storefront.users
            WHERE first_name like ${firstName}
        `;
    }

}
