import { Document } from 'mongoose';

export default interface ExpenseInterface extends Document {
    date: string;
    description: string;
    amount: number;
}
