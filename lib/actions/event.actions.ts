"use server"

import { CreateEventParams } from "@/types"
import { handleError } from "../utils"
import { connectToDB } from "../database"
import User from "../database/model/user.model"
import Event from "../database/model/event.model"


export const createEvent = async({event, userId, path}: CreateEventParams) => {
    try {
        await connectToDB();
        const organizer = await User.findById(userId);
        if(!organizer) throw new Error("Organizer not found")
        const newEvent = await Event.create({
            ...event,
            category: event.categoryId,
            organizer: userId
        })
        return JSON.parse(JSON.stringify(newEvent));
    }
    catch (err) {
        handleError(err);
    }
}