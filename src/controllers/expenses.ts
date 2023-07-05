import { NextFunction, Request, Response } from 'express';
import logging from '../config/logging';
import Expense from '../models/expense';
import mongoose from 'mongoose';
import ExpenseInterface from '../interface/expense';

const createExpense = (req: Request, res: Response, next: NextFunction) => {
    logging.info('Attempting to create new expense ...');

    let { date, description, amount } = req.body;

    const expense = new Expense({
        _id: new mongoose.Types.ObjectId(),
        date,
        description,
        amount
    });

    return expense
        .save()
        .then((newExpense) => {
            logging.info(`New expense created`);

            return res.status(200).json({ expense: newExpense });
        })
        .catch((error) => {
            logging.error(error.message);

            return res.status(500).json({
                message: error.message
            });
        });
};

const getExpense = (req: Request, res: Response, next: NextFunction) => {
    const _id = req.params.expenseID;
    logging.info(`request for an expense with id ${_id}`);

    Expense.findById(_id)
        .then((expense) => {
            if (expense) {
                return res.status(200).json({
                    expense: expense
                });
            } else {
                return res.status(404).json({
                    error: 'Expense not found.'
                });
            }
        })
        .catch((error) => {
            logging.error(error.message);

            return res.status(500).json({
                error: error.message
            });
        });
};

const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
    logging.info('Update request called');

    const _id = req.params.expenseID;

    try {
        const expense = await Expense.findById(_id).exec();

        if (expense) {
            expense.set(req.body);
            const savedExpense = await expense.save();

            logging.info(`Expense details with id ${_id} updated`);

            return res.status(201).json({
                expense: savedExpense
            });
        } else {
            return res.status(401).json({
                message: 'NOT FOUND'
            });
        }
    } catch (error) {
        const errorMessage = (error as Error).message;
        logging.error(errorMessage);

        return res.status(500).json({
            message: errorMessage
        });
    }
};

const getAllExpenses = async (req: Request, res: Response, next: NextFunction) => {
    logging.info('Request for all expenses called');

    try {
        const expenses = (await Expense.find().exec()) as ExpenseInterface[];
        return res.status(200).json({
            count: expenses.length,
            expenses: expenses
        });
    } catch (error: any) {
        logging.error((error as Error).message);
        return res.status(500).json({
            message: (error as Error).message
        });
    }
};

const deleteExpense = (req: Request, res: Response, next: NextFunction) => {
    logging.warn('Delete route called');

    const _id = req.params.expenseID;

    Expense.findByIdAndDelete(_id)
        .then(() => {
            return res.status(201).json({
                message: 'Expense deleted'
            });
        })
        .catch((error) => {
            logging.error(error.message);

            return res.status(500).json({
                message: error.message
            });
        });
};

export default {
    getAllExpenses,
    createExpense,
    getExpense,
    updateExpense,
    deleteExpense
};
