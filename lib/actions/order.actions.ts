"use server"

import { CheckoutOrderParams, CreateOrderParams } from "@/types"
import { handleError } from "../utils"
import { redirect } from "next/navigation";
import { connectToDB } from "../database";
import Order from "../database/model/order.model";
import Event from "../database/model/event.model";

export const checkoutOrder = async(order: CheckoutOrderParams) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const price = order.isFree ? 0 : Number(order.price) * 100;
    try {
        // US only Support Link & GPay
        const session = await stripe.checkout.sessions.create({
            line_items: [
              {
                price_data: {
                    currency: 'inr',
                    unit_amount: price,
                    product_data: {
                        name: order.eventTitle
                  }
                },
                quantity: 1
              },
            ],
            metadata: {
                eventId: order.eventId,
                buyer: order.buyerId
            },
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
            cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
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
    } catch (error) {
      handleError(error);
    }
  }