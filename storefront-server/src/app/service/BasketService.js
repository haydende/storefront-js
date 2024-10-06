import { DatabaseUtil } from "../util/DatabaseUtil.js";
import { convertFieldsToSnakecase } from "../util/StringUtil.js";

export class BasketService {

    sql

    constructor() {
        this.sql = DatabaseUtil.createConnection()
    }

    async getBasketWithId(id) {
        let response
        try {
            response = await this.sql`
                SELECT b.basket_id "basketId",
                       b.user_id "userId",
                       b.date_created "dateCreated",
                       b.status,
                       array_agg(bp.product_id) "productIds"
                FROM baskets b
                         LEFT JOIN basketproducts bp ON b.basket_id = bp.basket_id
                WHERE b.basket_id = ${BigInt(id)}
                GROUP BY b.basket_id, b.user_id, b.date_created, b.status;
            `

        } catch (error) {
            const errorStr = `Error occurred while getting the Basket with ID '${id}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async getBasketsForUserId(userId) {
        let response
        try {
            response = await this.sql`
                SELECT b.basket_id "basketId",
                       b.user_id "userId",
                       b.date_created "dateCreated",
                       b.status,
                       array_agg(bp.product_id) "productIds"
                FROM baskets b
                         LEFT JOIN basketproducts bp ON b.basket_id = bp.basket_id
                WHERE b.user_id = ${BigInt(userId)}
                GROUP BY b.basket_id, b.user_id, b.date_created, b.status;
            `

        } catch (error) {
            const errorStr = `Error occurred while getting Baskets for User with ID '${userId}: ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async createBasket(basket){
        let response
        try {
            basket = convertFieldsToSnakecase(basket)
            response = await this.sql`
                INSERT INTO baskets (${this.sql(basket)})
                RETURNING basket_id "basketId",
                          user_id "userId",
                          date_created "dateCreated",
                          status;  
            `

        } catch (error) {
            const errorStr = `Error occurred while insert a new Basket record: ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async addItemToBasket(basketId, productId, quantity) {

        let response
        try {

            let existingRecord = await this.sql`
                SELECT quantity
                FROM basketproducts
                WHERE basket_id = ${BigInt(basketId)} AND 
                      product_id = ${BigInt(productId)};
            `
            if (existingRecord[0]) {
                if (quantity === 0) {
                    await this.sql`
                        DELETE FROM basketproducts
                        WHERE basket_id = ${BigInt(basketId)} AND
                              product_id = ${BigInt(productId)};
                    `

                } else {
                    quantity = existingRecord.quantity + quantity

                    await this.sql`
                        UPDATE basketproducts
                        SET quantity = ${quantity}
                        WHERE basket_id = ${BigInt(basketId)} AND
                              product_id = ${BigInt(productId)}
                    `
                }

            } else {
                await this.sql`
                    INSERT INTO basketproducts 
                        (${this.sql({
                            basket_id: basketId,
                            product_id: productId,
                            quantity: quantity
                        })});
                `
            }
            response = {
                message: `productId '${productId}' with quantity '${quantity}' added to Basket '${basketId}'`
            }

        } catch (error) {
            const errorStr = `Error occurred while adding Quantity: ${quantity}, Product ID: '${productId}' to Basket '${basketId}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async updateBasket(id, basket){
        let response
        try {
            basket = convertFieldsToSnakecase(basket)
            response = await this.sql`
                UPDATE baskets
                SET ${this.sql(basket, columns)}
                WHERE basket_id = ${BigInt(id)}
                RETURNING *
            `

        } catch (error) {
            const errorStr = `Error occurred when updating Basket '${id}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

    async deleteBasket(basketId) {
        let response
        try {
            await this.sql`
                DELETE FROM baskets
                WHERE basket_id = ${BigInt(basketId)}
            `

        } catch (error) {
            const errorStr = `Error occurred when deleting Basket '${basketId}': ${error.message}`
            console.error(errorStr)
            response = { error: errorStr }
        }
        return response
    }

}