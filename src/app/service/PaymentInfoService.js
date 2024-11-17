import { DatabaseUtil } from "../util/DatabaseUtil.js";
import { convertFieldsToSnakecase } from "../util/StringUtil.js";

export class PaymentInfoService {

    sql;

    constructor() {
        this.sql = DatabaseUtil.createConnection()
    }

    async getPaymentInfoWithId(paymentInfoId) {
        return await this.sql`
            SELECT * 
            FROM paymentinfo
            WHERE payment_id = ${paymentInfoId}
        `
    }

    async getPaymentInfoForUserId(userId) {
        return await this.sql`
            SELECT payment_id "paymentId",
                   user_id "userId",
                   method,
                   card_number "cardNumber",
                   expiry_date "expiryDate",
                   cvv,
                   account_number "accountNumber",
                   is_default "isDefault"
            FROM paymentinfo
            WHERE user_id = ${userId};
        `
    }

    async createPaymentInfo(paymentInfo) {
        let response
        try {
            paymentInfo = convertFieldsToSnakecase(paymentInfo)
            const columns = Object.keys(paymentInfo)
            const values = Object.values(paymentInfo)

            response = await this.sql`
                INSERT INTO paymentinfo ${this.sql(paymentInfo)}
                VALUES ${this.sql(paymentInfo, values)}
                RETURNING payment_id "paymentId",
                          user_id "userId",
                          method,
                          card_number "cardNumber",
                          expiry_date "expiryDate",
                          cvv,
                          account_number "accountNumber",
                          is_default "isDefault"
            `
        } catch (error) {
            let errorStr = `Error occurred while inserting new PaymentInfo record: ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

    async updatePaymentInfo(id, paymentInfo) {

        let response
        try {
            paymentInfo = convertFieldsToSnakecase(paymentInfo)
            response = await this.sql`
                INSERT INTO paymentinfo (${this.sql(paymentInfo)})
                RETURNING payment_id "paymentId",
                          user_id "userId",
                          method,
                          card_number "cardNumber",
                          expiry_date "expiryDate",
                          cvv,
                          account_number "accountNumber",
                          is_default "isDefault"
            `
        } catch (error) {
            let errorStr = `Error occurred while updating PaymentInfo record: ${error.message}`
            console.error(errorStr)
            response = error
        }
        return response
    }

    async deletePaymentInfo(paymentInfoId) {
        await this.sql`
            DELETE FROM paymentinfo
            WHERE payment_id = ${paymentInfoId}
        `
    }

}