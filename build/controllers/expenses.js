"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../config/logging"));
const expense_1 = __importDefault(require("../models/expense"));
const mongoose_1 = __importDefault(require("mongoose"));
const createExpense = (req, res, next) => {
    logging_1.default.info('Attempting to create new expense ...');
    let { date, description, amount } = req.body;
    const expense = new expense_1.default({
        _id: new mongoose_1.default.Types.ObjectId(),
        date,
        description,
        amount
    });
    return expense
        .save()
        .then((newExpense) => {
        logging_1.default.info(`New expense created`);
        return res.status(200).json({ expense: newExpense });
    })
        .catch((error) => {
        logging_1.default.error(error.message);
        return res.status(500).json({
            message: error.message
        });
    });
};
const getExpense = (req, res, next) => {
    const _id = req.params.expenseID;
    logging_1.default.info(`request for an expense with id ${_id}`);
    expense_1.default.findById(_id)
        .then((expense) => {
        if (expense) {
            return res.status(200).json({
                expense: expense
            });
        }
        else {
            return res.status(404).json({
                error: 'Expense not found.'
            });
        }
    })
        .catch((error) => {
        logging_1.default.error(error.message);
        return res.status(500).json({
            error: error.message
        });
    });
};
const updateExpense = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    logging_1.default.info('Update request called');
    const _id = req.params.expenseID;
    try {
        const expense = yield expense_1.default.findById(_id).exec();
        if (expense) {
            expense.set(req.body);
            const savedExpense = yield expense.save();
            logging_1.default.info(`Expense details with id ${_id} updated`);
            return res.status(201).json({
                expense: savedExpense
            });
        }
        else {
            return res.status(401).json({
                message: 'NOT FOUND'
            });
        }
    }
    catch (error) {
        const errorMessage = error.message;
        logging_1.default.error(errorMessage);
        return res.status(500).json({
            message: errorMessage
        });
    }
});
const getAllExpenses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    logging_1.default.info('Request for all expenses called');
    try {
        const expenses = (yield expense_1.default.find().exec());
        return res.status(200).json({
            count: expenses.length,
            expenses: expenses
        });
    }
    catch (error) {
        logging_1.default.error(error.message);
        return res.status(500).json({
            message: error.message
        });
    }
});
const deleteExpense = (req, res, next) => {
    logging_1.default.warn('Delete route called');
    const _id = req.params.expenseID;
    expense_1.default.findByIdAndDelete(_id)
        .then(() => {
        return res.status(201).json({
            message: 'Expense deleted'
        });
    })
        .catch((error) => {
        logging_1.default.error(error.message);
        return res.status(500).json({
            message: error.message
        });
    });
};
exports.default = {
    getAllExpenses,
    createExpense,
    getExpense,
    updateExpense,
    deleteExpense
};
//# sourceMappingURL=expenses.js.map