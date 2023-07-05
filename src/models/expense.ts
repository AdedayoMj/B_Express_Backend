import mongoose, { Schema } from 'mongoose';
import ExpenseInterface from '../interface/expense';

const ExpenseSchema: Schema = new Schema({
    date: { type: String },
    description: { type: String },
    amount: { type: Number }
});

export default mongoose.model<ExpenseInterface>('Expense', ExpenseSchema);
