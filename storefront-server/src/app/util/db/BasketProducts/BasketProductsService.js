import {Database} from "../database.js";

class BasketProductsService {

    sql

    constructor() {
        this.sql = Database.createConnection()
    }

    async getProductsInBasket(basketId){
        return await this.sql`
            SELECT * 
            FROM storefront.basketproducts
            WHERE basket_id = ${basketId}
        `
    }

    async addBasketProductForBasket({basketId, productId, quantity, ...otherFields}) {
        if (!basketId) {
            throw new Error('Provided Basket Item contains no Basket ID')
        }
        if (!productId) {
            throw new Error('Provided Basket Item contains no Product ID')
        }
        if (!quantity) {
            throw new Error('Provided Basket Item contains no Quantity')
        }

        const returnedBasketEntries = await this.sql`
            SELECT *
            FROM storefront.basketproducts
            WHERE basket_id = ${BigInt(basketId)} AND
                  product_id = ${BigInt(productId)}
        `

        if (returnedBasketEntries.length > 0) {
            throw new Error('Provided Basket already includes this item. Please update the quantity instead.')
        }

        const basketProduct = {basketId, productId, quantity, ...otherFields}
        const columns = Object.keys(basketProduct)
        const values = Object.values(basketProduct)

        return await this.sql`
            INSERT INTO storefront.basketproducts (${this.sql(basketProduct, columns)})
            VALUES ${this.sql(basketProduct, values)}
            RETURNING *
        `
    }

    async addToBasketProductQuantityForBasket({basketId, productId, quantity }) {
        if (!basketId) {
            throw new Error('Provided Basket Item contains no Basket ID')
        }
        if (!productId) {
            throw new Error('Provided Basket Item contains no Product ID')
        }
        if (!quantity) {
            throw new Error('Provided Basket Item contains no Quantity')
        }

        const returnedBasketQuantity = await this.sql`
            SELECT quantity 
            FROM storefront.basketproducts
            WHERE basket_id = ${BigInt(basketId)} AND
                  product_id = ${BigInt(productId)}
        `
        const originalQuantity = returnedBasketQuantity[0]
        if (!originalQuantity) {
            throw new Error(`Provided BasketID [${basketId}] and ProductID [${productId}] combination does not exist.`)
        }

        const newQuantity = originalQuantity + quantity

        return await this.sql`
            UPDATE storefront.basketproducts
            SET quantity = ${newQuantity}
            WHERE basket_id = ${BigInt(basketId)} AND
                  product_id = ${BigInt(productId)}
            RETURNING *
        `
    }

    async removeProductFromBasket({basketId, productId}) {
        await this.sql`
            DELETE FROM storefront.basketproducts
            WHERE basket_id = ${BigInt(basketId)} AND 
                  product_id = ${BigInt(productId)}
        `
    }



}