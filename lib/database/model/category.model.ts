import { Schema, model, models } from "mongoose";

export interface ICategory extends Document {
    _id: string;
    name: string;
}
const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

const Category = models.Category || model<ICategory>('Category',categorySchema)

export default Category