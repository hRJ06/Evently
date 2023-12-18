import mongoose from 'mongoose'
let isconnected = false

export const connectToDB= async() => {
    if(!process.env.MONGODB_URL) return console.log('MONGODB_URL is required')
    if(isconnected) return console.log('Already connected')
    try {   
        await mongoose.connect(process.env.MONGODB_URL)
        isconnected = true;
    }
    catch(e: any) {
        console.log('Error')
    }
}