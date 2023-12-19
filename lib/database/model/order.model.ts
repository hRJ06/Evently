import { Schema, Types, model, models } from "mongoose";

export interface IOrder extends Document {
    _id: string,
    createdAt: Date
    stripeId: string
    totalAmount: string
    event: Types.ObjectId,
    buyer: Types.ObjectId
}
const orderSchema = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
    },
    stripeId: {
        type: String,
        required: true,
        unique: true,
    },
    totalAmount: {
        type: String,
    },
    event: {
        type: Schema.Types.ObjectId,
        ref: 'Event'
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Order = models.Order || model('Order', orderSchema);
export default Order;