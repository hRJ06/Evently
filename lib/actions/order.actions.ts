"use server"

import { CheckoutOrderParams, CreateOrderParams, GetOrdersByEventParams, GetOrdersByUserParams } from "@/types"
import { handleError } from "../utils"
import { redirect } from "next/navigation";
import { connectToDB } from "../database";
import Order from "../database/model/order.model";
import Event from "../database/model/event.model";
import User from "../database/model/user.model";
import { ObjectId, Types } from "mongoose";

export const checkoutOrder = async (order: CheckoutOrderParams) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const price = order.isFree ? 0 : Number(order.price) * 100;

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'inr', 
                        unit_amount: price,
                        product_data: {
                            name: order.eventTitle,
                            images: [`${order.eventPicture}`]
                        }
                    },
                    quantity: 1
                },
            ],
            metadata: {
                eventId: order.eventId,
                buyerId: order.buyerId
            },
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
            payment_intent_data: {
                receipt_email: 'customer@example.com', 
                shipping: {
                    name: 'Customer X', 
                    address: {
                        line1: 'Address Line 1 X',
                        line2: 'Address Line 2 X',
                        city: 'City X',
                        state: 'State X',
                        postal_code: 'Postal Code X',
                        country: 'US', 
                    }
                }
            },
        });
        redirect(session.url!);
    } 
    catch (err) {
        throw err;
    }
}


export const createOrder = async (order: CreateOrderParams) => {
    try {
        await connectToDB();
        const newOrder = await Order.create({
            ...order,
            event: order.eventId,
            buyer: order.buyerId,
        });
        const event = await Event.findById(order.eventId);
        if(event && Number(event.tickets) > 0) {
            event.tickets = (Number(event.tickets) - 1).toString();
            event.save();
        }
        return JSON.parse(JSON.stringify(newOrder));
    } 
    catch (error) {
      handleError(error);
    }
}

export async function getOrdersByUser({userId, limit = 3, page}: GetOrdersByUserParams) {
    try {
        await connectToDB();
        const skipAmount = (Number(page) - 1) * limit;
        const conditions = {buyer: userId}
        const orders = await Order.distinct('event._id').find(conditions).sort({createdAt: 'desc'}).skip(skipAmount).limit(limit).populate({
            path: 'event',
            model: Event,
            populate: {
              path: 'organizer',
              model: User,
              select: '_id firstName lastName',
            },
        })
        const ordersCount = await Order.distinct('event._id').countDocuments(conditions);
        return {
            data: JSON.parse(JSON.stringify(orders)),
            totalPages: Math.ceil(ordersCount / limit)
        }
    }
    catch (error) {
        handleError(error);
    }
}

export async function getOrdersByEvent({ searchString, eventId }: GetOrdersByEventParams) {
    try {
        await connectToDB()
    
        if (!eventId) throw new Error('Event ID is required')
        const eventObjectId = new Types.ObjectId(eventId)
    
        const orders = await Order.aggregate([
            {
            $lookup: {
                from: 'users',
                localField: 'buyer',
                foreignField: '_id',
                as: 'buyer',
            },
            },
            {
            $unwind: '$buyer',
            },
            {
            $lookup: {
                from: 'events',
                localField: 'event',
                foreignField: '_id',
                as: 'event',
            },
            },
            {
            $unwind: '$event',
            },
            {
            $project: {
                _id: 1,
                totalAmount: 1,
                createdAt: 1,
                eventTitle: '$event.title',
                eventId: '$event._id',
                buyer: {
                $concat: ['$buyer.firstName', ' ', '$buyer.lastName'],
                },
            },
            },
            {
            $match: {
                $and: [{ eventId: eventObjectId }, { buyer: { $regex: RegExp(searchString, 'i') } }],
            },
            },
        ])
    
        return JSON.parse(JSON.stringify(orders))
    } 
    catch (error) {
      handleError(error)
    }
}