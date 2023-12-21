import { Schema, Types, model, models } from "mongoose";

export interface IEvent extends Document {
    _id: string;
    title: string;
    description?: string;
    createdAt: Date;
    imageUrl?: string;
    startDateTime: Date;
    endDateTime: Date;
    price?: string;
    isFree: boolean;
    url?: string;
    category: {
        _id: string,
        name: string
    };
    organizer: {
        _id: string,
        firstName: string
        lastName: string
    };
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
        type: String,
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
    price: {
        type: String
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