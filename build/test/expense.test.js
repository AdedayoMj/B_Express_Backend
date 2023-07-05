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
const expenses_1 = __importDefault(require("../controllers/expenses"));
const expense_1 = __importDefault(require("../models/expense"));
const logging_1 = __importDefault(require("../config/logging"));
jest.mock('../models/expense');
const warnSpy = jest.spyOn(logging_1.default, 'warn');
const errorSpy = jest.spyOn(logging_1.default, 'error');
describe('createExpense', () => {
    test('should create a new expense and return 200 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {
            body: { date: '2023-07-05', description: 'Expense description', amount: 100 }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        const mockSave = jest.fn().mockResolvedValueOnce('newExpense');
        jest.spyOn(expense_1.default.prototype, 'save').mockImplementationOnce(mockSave);
        yield expenses_1.default.createExpense(req, res, next);
        expect(mockSave).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ expense: 'newExpense' });
    }));
    test('should handle error and return 500 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const req = {
            body: { date: '2023-07-05', description: 'Expense description', amount: 100 }
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();
        jest.spyOn(expense_1.default.prototype, 'save').mockRejectedValueOnce(new Error('Some error'));
        yield expenses_1.default.createExpense(req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Some error' });
    }));
});
describe('getExpense', () => {
    test('should retrieve an existing expense and return 200 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const expenseId = 'mockedExpenseId';
        const mockRequest = {
            params: { expenseID: expenseId }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNextFunction = jest.fn();
        const mockFindById = jest.fn().mockResolvedValueOnce({});
        expense_1.default.findById = mockFindById;
        yield expenses_1.default.getExpense(mockRequest, mockResponse, mockNextFunction);
        expect(mockFindById).toHaveBeenCalledWith(expenseId);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({ expense: expect.any(Object) });
    }));
    test('should handle not found expense and return 404 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const expenseId = 'nonExistingExpenseId';
        const mockRequest = {
            params: { expenseID: expenseId }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNextFunction = jest.fn();
        const mockFindById = jest.fn().mockResolvedValueOnce(null);
        expense_1.default.findById = mockFindById;
        yield expenses_1.default.getExpense(mockRequest, mockResponse, mockNextFunction);
        expect(mockFindById).toHaveBeenCalledWith(expenseId);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Expense not found.' });
    }));
});
describe('updateExpense', () => {
    test('should update the expense and return 201 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = {
            params: {
                expenseID: '123456789'
            },
            body: {
                amount: 200
            }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNextFunction = jest.fn();
        const mockExpenseInstance = {
            set: jest.fn(),
            save: jest.fn()
        };
        const findByIdSpy = jest.spyOn(expense_1.default, 'findById').mockResolvedValueOnce(mockExpenseInstance);
        const infoSpy = jest.spyOn(logging_1.default, 'info').mockImplementation();
        yield expenses_1.default.updateExpense(mockRequest, mockResponse, mockNextFunction);
        expect(infoSpy).toHaveBeenCalledWith('Update request called');
        expect(expense_1.default.findById).toHaveBeenCalledWith('123456789');
        findByIdSpy.mockRestore();
    }));
    test('should handle not found expense and return 401 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const expenseId = 'nonExistingExpenseId';
        const updatedExpenseData = { amount: 600 };
        const mockRequest = {
            params: { expenseID: expenseId },
            body: updatedExpenseData
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNextFunction = jest.fn();
        const mockFindById = jest.fn().mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(null)
        });
        expense_1.default.findById = mockFindById;
        yield expenses_1.default.updateExpense(mockRequest, mockResponse, mockNextFunction);
        expect(mockFindById).toHaveBeenCalledWith(expenseId);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'NOT FOUND' });
    }));
});
describe('getAllExpenses', () => {
    let mockRequest;
    let mockResponse;
    let mockNextFunction;
    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNextFunction = jest.fn();
    });
    it('should return all expenses and return 200 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockExpenses = [
            { _id: 'expense1', date: '2023-01-01', description: 'Expense 1', amount: 100 },
            { _id: 'expense2', date: '2023-01-02', description: 'Expense 2', amount: 200 }
        ];
        expense_1.default.find.mockReturnValueOnce({
            exec: jest.fn().mockResolvedValueOnce(mockExpenses)
        });
        yield expenses_1.default.getAllExpenses(mockRequest, mockResponse, mockNextFunction);
        expect(expense_1.default.find).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith({
            count: mockExpenses.length,
            expenses: mockExpenses
        });
    }));
});
describe('deleteExpense', () => {
    it('should delete the expense and return 201 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = {
            params: {
                expenseID: '123456789'
            }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNextFunction = jest.fn();
        const findByIdAndDeleteSpy = jest.spyOn(expense_1.default, 'findByIdAndDelete').mockResolvedValueOnce(undefined);
        yield expenses_1.default.deleteExpense(mockRequest, mockResponse, mockNextFunction);
        expect(warnSpy).toHaveBeenCalledWith('Delete route called');
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith('123456789');
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Expense deleted'
        });
        findByIdAndDeleteSpy.mockRestore();
    }));
    it('should handle an error and return 500 status code', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockRequest = {
            params: {
                expenseID: '123456789'
            }
        };
        const mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNextFunction = jest.fn();
        const errorMessage = 'Internal Server Error';
        const findByIdAndDeleteSpy = jest.spyOn(expense_1.default, 'findByIdAndDelete').mockRejectedValueOnce(new Error(errorMessage));
        yield expenses_1.default.deleteExpense(mockRequest, mockResponse, mockNextFunction);
        expect(logging_1.default.warn).toHaveBeenCalledWith('Delete route called');
        expect(findByIdAndDeleteSpy).toHaveBeenCalledWith('123456789');
        expect(errorSpy).toHaveBeenCalled();
        findByIdAndDeleteSpy.mockRestore();
    }));
});
//# sourceMappingURL=expense.test.js.map