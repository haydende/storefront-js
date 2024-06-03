import { BaseEntity } from "./BaseEntity.js";

export class PaymentInfo extends BaseEntity {

    customerId;
    paymentMethod;
    cardNumber;
    expiryMonth;
    expiryYear;
    cvv;
    accountNumber;
    routingNumber;
    paymentToken;
    isDefault;

}