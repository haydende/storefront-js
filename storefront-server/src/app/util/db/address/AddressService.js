import { Database } from '../database'

export class AddressService {

    sql;

    constructor() {
        this.sql = Database.createConnection();
    }

    async getAddressesForCustomerId(customerId) {
        return await this.sql`
            SELECT * 
            FROM storefront.addresses
            WHERE customer_id == ${customerId}
        `
    }

}