import { Schema, Types, model, models } from "mongoose";

const userSchema = new Schema({
    clerkId: {
        type: String, 
        required: true,
        unique: true
    },
    email: {
        type: String, 
        required: true,
        unique: true
    },
    username: {
        type: String, 
        required: true,
        unique: true
    },
    firstName: {
        type: String, 
        required: true,
    },
    lastName: {
        type: String, 
        required: true,
    },
    photo: {
        type: String, 
        required: true,
    },
    events: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Event'
        }
    ],
    orders: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }
    ]
})

const User = models.User || model('User',userSchema);

export default User;