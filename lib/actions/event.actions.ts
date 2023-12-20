"use server"

import { CreateEventParams, GetAllEventsParams } from "@/types"
import { handleError } from "../utils"
import { connectToDB } from "../database"
import User from "../database/model/user.model"
import Event from "../database/model/event.model"
import Category from "../database/model/category.model"


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

export const getEventById = async(eventId: string) => {
    try {
        await connectToDB()
        const event = await Event.findById(eventId).populate({
            path: 'organizer',
            model: User,
            select: '_id firstName lastName'
        }).populate({
            path: 'category',
            model: Category,
            select: '_id name'
        })
        if(!event) throw new Error("Event not found")
        // Creating a Deep Copy
        return JSON.parse(JSON.stringify(event));
    }
    catch (err) {
        handleError(err);
    }
}

export const getAllEvents = async({query, limit = 6, page, category}: GetAllEventsParams) => {
    try {
        await connectToDB();
        const conditions = {}
        const events = await Event.find(conditions).sort({createdAt: 'desc'}).skip(0).limit(limit).populate({
            path: 'organizer',
            model: User,
            select: '_id firstName lastName'
        }).populate({
            path: 'category',
            model: Category,
            select: '_id name'
        });
        const eventsCount = await Event.countDocuments(conditions);
        return {
            data: JSON.parse(JSON.stringify(events)),
            totalPages: Math.ceil(eventsCount / limit)
        }
    }
    catch (err) {
        handleError(err);
    }
}