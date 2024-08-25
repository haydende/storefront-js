import { DatabaseUtil } from "../util/DatabaseUtil.js";

class PaymentInfoService {

    sql;

    constructor() {
        this.sql = DatabaseUtil.createConnection()
    }

    async getPaymentInfoWithId(paymentInfoId) {
        return await this.sql`
            SELECT * 
            FROM storefront.paymentinfo
            WHERE payment_id = ${paymentInfoId}
        `
    }

    async createPaymentInfo({paymentInfoId, customerId, ...otherFields}) {
        if (paymentInfoId) {
            throw new Error('Provided Payment Info contains an ID.')
        }
        if (!customerId) {
            throw new Error('Provided Payment Info contains no Customer ID.')
        }

        const paymentInfo = { paymentInfoId, customerId, ...otherFields }
        const columns = Object.keys(paymentInfo)
        const values = Object.values(paymentInfo)

        return await this.sql`
            INSERT INTO storefront.paymentinfo (${this.sql(paymentInfo, columns)})
            VALUES ${this.sql(paymentInfo, values)}
            RETURNING *
        `
    }

    async updatePaymentInfo({paymentInfoId, ...otherFields}) {
        if (!paymentInfoId) {
            throw new Error('Provided Payment Info does not contain an ID.')
        }

        const paymentInfo = { paymentInfoId, ...otherFields }
        const columns = Object.keys(paymentInfo)

        return await this.sql`
            UPDATE storefront.paymentinfo
            SET ${this.sql(paymentInfo, columns)}
            WHERE payment_id = ${paymentInfoId}
            RETURNING *
        `
    }

    async deletePaymentInfo(paymentInfoId) {
        await this.sql`
            DELETE FROM storefront.paymentinfo
            WHERE payment_id = ${paymentInfoId}
        `
    }

}