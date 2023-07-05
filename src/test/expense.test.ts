import controller from '../controllers/expenses';
import { Request, Response, NextFunction } from 'express';
import Expense from '../models/expense';
import ExpenseInterface from '../interface/expense';
import logging from '../config/logging';

jest.mock('../models/expense');
const warnSpy = jest.spyOn(logging, 'warn');
const errorSpy = jest.spyOn(logging, 'error');

describe('createExpense', () => {
    test('should create a new expense and return 200 status code', async () => {
        const req = {
            body: { date: '2023-07-05', description: 'Expense description', amount: 100 }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;
        const next = jest.fn() as NextFunction;

        const mockSave = jest.fn().mockResolvedValueOnce('newExpense');
        jest.spyOn(Expense.prototype, 'save').mockImplementationOnce(mockSave);
        

        await controller.createExpense(req, res, next);

        expect(mockSave).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ expense: 'newExpense' });
    });

    test('should handle error and return 500 status code', async () => {
        const req = {
            body: { date: '2023-07-05', description: 'Expense description', amount: 100 }
        } as Request;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;
        const next = jest.fn() as NextFunction;

        jest.spyOn(Expense.prototype, 'save').mockRejectedValueOnce(new Error('Some error'));

        await controller.createExpense(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Some error' });
    });
});

describe('getExpense', () => {
    test('should retrieve an existing expense and return 200 status code', async () => {
        const expenseId = 'mockedExpenseId';
        const mockRequest = {
            params: { expenseID: expenseId }
        } as unknown as Request;
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;
        const mockNextFunction = jest.fn() as NextFunction;

        const mockFindById = jest.fn().mockResolvedValueOnce({} as ExpenseInterface);
        Expense.findById = mockFindById;

        await controller.getExpense(mockRequest, mockResponse, mockNextFunction);

        expect(mockFindById).toHaveBeenCalledWith(expenseId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ expense: expect.any(Object) });
    });

    test('should handle not found expense and return 404 status code', async () => {
        const expenseId = 'nonExistingExpenseId';
        const mockRequest = {
            params: { expenseID: expenseId }
        } as unknown as Request;
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;
        const mockNextFunction = jest.fn() as NextFunction;

        const mockFindById = jest.fn().mockResolvedValueOnce(null);
        Expense.findById = mockFindById;

        await controller.getExpense(mockRequest, mockResponse, mockNextFunction);

        expect(mockFindById).toHaveBeenCalledWith(expenseId);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Expense not found.' });
    });
});

describe('updateExpense', () => {
    test('should update the expense and return 201 status code', async () => {
        const mockRequest = {
            params: {
                expenseID: '123456789'
            },
            body: {
                amount: 200
            }
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const mockNextFunction = jest.fn() as NextFunction;

        const mockExpenseInstance: Partial<ExpenseInterface> = {
            set: jest.fn(),
            save: jest.fn()
        };

        const findByIdSpy = jest.spyOn(Expense, 'findById').mockResolvedValueOnce(mockExpenseInstance);
        const infoSpy = jest.spyOn(logging, 'info').mockImplementation();

        await controller.updateExpense(mockRequest, mockResponse, mockNextFunction);

        expect(infoSpy).toHaveBeenCalledWith('Update request called');
        expect(Expense.findById).toHaveBeenCalledWith('123456789');

        findByIdSpy.mockRestore();
    });

    test('should handle not found expense and return 401 status code', async () => {
        const expenseId = 'nonExistingExpenseId';
        const updatedExpenseData = { amount: 600 };
        const mockRequest = {
            params: { expenseID: expenseId },
            body: updatedExpenseData
        } as unknown as Request;
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;
        const mockNextFunction = jest.fn() as NextFunction;

        const mockFindById = jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(null)
        });
        Expense.findById = mockFindById;

        await controller.updateExpense(mockRequest, mockResponse, mockNextFunction);

        expect(mockFindById).toHaveBeenCalledWith(expenseId);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'NOT FOUND' });
    });
});

describe('getAllExpenses', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNextFunction = jest.fn();
    });

    it('should return all expenses and return 200 status code', async () => {
        const mockExpenses: Partial<ExpenseInterface>[] = [
            { _id: 'expense1', date: '2023-01-01', description: 'Expense 1', amount: 100 },
            { _id: 'expense2', date: '2023-01-02', description: 'Expense 2', amount: 200 }
        ];
        (Expense.find as jest.Mock).mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(mockExpenses)
        });

        await controller.getAllExpenses(mockRequest as Request, mockResponse as Response, mockNextFunction);

        expect(Expense.find).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            count: mockExpenses.length,
            expenses: mockExpenses
        });
    });
});

describe('deleteExpense', () => {
    it('should delete the expense and return 201 status code', async () => {
        const mockRequest = {
            params: {
                expenseID: '123456789'
            }
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const mockNextFunction = jest.fn() as NextFunction;

        const findByIdAndDeleteSpy = jest.spyOn(Expense, 'findByIdAndDelete').mockResolvedValueOnce(undefined);

        await controller.deleteExpense(mockRequest, mockResponse, mockNextFunction);

        expect(warnSpy).toHaveBeenCalledWith('Delete route called');
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith('123456789');
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Expense deleted'
        });

        findByIdAndDeleteSpy.mockRestore();
    });

    it('should handle an error and return 500 status code', async () => {
        const mockRequest = {
            params: {
                expenseID: '123456789'
            }
        } as unknown as Request;

        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as unknown as Response;

        const mockNextFunction = jest.fn() as NextFunction;

        const errorMessage = 'Internal Server Error';
        const findByIdAndDeleteSpy = jest.spyOn(Expense, 'findByIdAndDelete').mockRejectedValueOnce(new Error(errorMessage));

        await controller.deleteExpense(mockRequest, mockResponse, mockNextFunction);

        expect(logging.warn).toHaveBeenCalledWith('Delete route called');
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith('123456789');
        expect(errorSpy).toHaveBeenCalled();

        findByIdAndDeleteSpy.mockRestore();
    });
});
