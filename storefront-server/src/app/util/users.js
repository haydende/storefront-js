import { sql } from './database.js'

export async function getUsersWithFirstNameLike(firstName) {
    const users = await sql`
        SELECT *
        FROM Storefront.Users
        WHERE first_name like ${firstName}
    `;

    return users;
}
