"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const expenses_1 = __importDefault(require("../controllers/expenses"));
const router = express_1.default.Router();
router.get('/:expenseID', expenses_1.default.getExpense);
router.get('/', expenses_1.default.getAllExpenses);
router.post('/createExpense', expenses_1.default.createExpense);
router.patch('/update/:expenseID', expenses_1.default.updateExpense);
router.delete('/:expenseID', expenses_1.default.deleteExpense);
module.exports = router;
//# sourceMappingURL=expense.js.map