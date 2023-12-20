import { Schema, Types, model, models } from "mongoose";

export interface IEvent extends Document {
    _id: string;
    title: string;
    description?: string;
    createdAt: Date;
    imageUrl?: string;
    startDateTime: Date;
    price?: string;
    isFree: boolean;
    url?: string;
    category: Types.ObjectId;
    organizer: Types.ObjectId;
}

const EventSchema = new Schema({
    title: {
        type: String, 
        required: true,
    },
    description: {
        type: String, 
        required: true,
    },
    location: {
        type: String, 
    },
    tickets: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    imageUrl: {
        type: String,
        required: true,
    },
    startDateTime: {
        type: Date,
        required: true
    },
    endDateTime: {
        type: Date,
        required: true
    },
    isFree: {
        type: Boolean
    },
    url: {
        type: String
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    organizer: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Event = models.Event || model<IEvent>('Event',EventSchema);
export default Event;