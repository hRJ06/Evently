'use server'

import { CreateUserParams, UpdateUserParams } from "@/types"
import { handleError } from "../utils"
import { connectToDB } from "../database"
import User from "../database/model/user.model"
import Event from "../database/model/event.model"
import Order from "../database/model/order.model"
import { revalidatePath } from "next/cache"

export const createUser = async(user: CreateUserParams) => {
    try {
        await connectToDB();
        const newUser = await User.create(user);
        return JSON.parse(JSON.stringify(newUser))
    }
    catch (err) {
        handleError(err)
    }
}

export const updateUser = async(clerkId: string,user: UpdateUserParams) => {
    try {
        await connectToDB();
        const updatedUser = await User.findOneAndUpdate({clerkId: clerkId}, user, {new : true});
        if(!updatedUser) throw new Error('User update failed');
        return JSON.parse(JSON.stringify(updatedUser));
    }
    catch (err) {
        handleError(err);
    }
}

export const deleteUser = async(clerkId: string) => {
    try {
        await connectToDB();
        const userToDelete = await User.findOne({clerkId:clerkId});
        if(!userToDelete) throw new Error('User not found');
        await Event.updateMany({
            _id: {
                $in: userToDelete.events
            }
        },{
            $pull: {
                organizer: userToDelete._id
            }
        })
        await Order.updateMany({
            _id: {
                $in: userToDelete.orders
            }
        }, {
            $unset: {
                buyer: 1
            }
        })
        const deletedUser = await User.findByIdAndDelete({_id : userToDelete._id});
        // In order to update the login status by revalidating cache
        revalidatePath("/");
        return JSON.parse(JSON.stringify(deletedUser));
    }
    catch (err) {
        handleError(err);
    }
}