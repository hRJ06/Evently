"use server"

import { CreateEventParams, DeleteEventParams, GetAllEventsParams, UpdateEventParams } from "@/types"
import { handleError } from "../utils"
import { connectToDB } from "../database"
import User from "../database/model/user.model"
import Event from "../database/model/event.model"
import Category from "../database/model/category.model"
import { revalidatePath } from "next/cache"


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

export const deleteEvent = async({eventId, path}:DeleteEventParams) => {
    try {   
        await connectToDB()
        const deleteEvent = await Event.findByIdAndDelete(eventId)
        if(deleteEvent) revalidatePath(path)
    }
    catch (err) {
        handleError(err);
    }
}

export async function updateEvent({ userId, event, path }: UpdateEventParams) {
    try {
      await connectToDB()
  
      const eventToUpdate = await Event.findById(event._id)
      if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
        throw new Error('Unauthorized or event not found')
      }
  
      const updatedEvent = await Event.findByIdAndUpdate(
        event._id,
        { ...event, category: event.categoryId },
        { new: true }
      )
      revalidatePath(path)
  
      return JSON.parse(JSON.stringify(updatedEvent))
    } catch (error) {
      handleError(error)
    }
  }