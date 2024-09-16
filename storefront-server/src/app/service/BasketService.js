import { DatabaseUtil } from "../util/DatabaseUtil.js";

class BasketService {

    sql

    constructor() {
        this.sql = DatabaseUtil.createConnection()
    }

    async getBasketForCustomerId(customerId) {
        return await this.sql`
            SELECT * 
            FROM baskets
            WHERE customer_id = ${customerId}
        `
    }

    async createBasket({basketId, customerId, ...otherBasketFields}){
        if (basketId) {
            throw new Error('Provided Basket contains an ID.')
        }
        if (!customerId) {
            throw new Error('Provided Customer contains no Customer ID.')
        }

        const basket = {basketId, customerId, ...otherBasketFields}
        const columns = Object.keys(basket)
        const values = Object.values(basket)

        return await this.sql`
            INSERT INTO baskets (${this.sql(basket, columns)})
            VALUES ${this.sql(basket, values)}
            RETURNING *
        `
    }

    async updateBasket({basketId, ...otherBasketFields}){
        if (!basketId) {
            throw new Error('Provided Basket does not contain an ID.')
        }

        const basket = {basketId, ...otherBasketFields}
        const columns = Object.keys(basket)

        return await this.sql`
            UPDATE baskets
            SET ${this.sql(basket, columns)}
            WHERE basket_id = ${BigInt(basketId)}
            RETURNING *
        `
    }

    async deleteBasket(basketId) {
        await this.sql`
            DELETE FROM baskets
            WHERE basket_id = ${BigInt(basketId)}
        `
    }

}