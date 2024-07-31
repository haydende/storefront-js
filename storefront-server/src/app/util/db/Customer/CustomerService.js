import {Database} from "../database.js";

class CustomerService {

    sql;

    constructor() {
        this.sql = Database.createConnection();
    }

    async getCustomerWithId(id) {
        return await this.sql`
            SELECT *
            FROM storefront.customers
            WHERE customer_id = ${BigInt(id)}
        `
    }

    async createCustomer(customer) {

        const columns = Object.keys(custmomer)
        const values = Object.values(customer)

        let response;
        try {
            response = await this.sql`
                INSERT INTO storefront.customers (${this.sql(customer, columns)})
                VALUES ${this.sql(customer, values)}
                RETURNING * 
            `

        } catch (error) {
            let errorMessage = `An error occurred when creating a new Customer record: ${error.message}`
            console.error(errorMessage)
            response = { error: errorMessage }

        }

        return response;
    }

    async updateCustomer({customerId, ...otherCustomerFields}) {

        if (!customerId) {
            throw new Error('Provided Customer does not contain an ID.')
        }

        const customer = {customerId, ...otherCustomerFields}
        const columns = Object.keys(customer)

        return this.sql`
            UPDATE storefront.customers
            SET ${this.sql(customer, columns)}
            WHERE customer_id = ${BigInt(customerId)}
            RETURNING *
        `
    }

    async deleteCustomer(customerId) {
        return this.sql`
            DELETE FROM storefront.customers
            WHERE customer_id = ${BigInt(customerId)}
        `
    }

}