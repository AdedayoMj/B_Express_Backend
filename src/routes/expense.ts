import express from 'express';
import controller from '../controllers/expenses';

const router = express.Router();

router.get('/:expenseID', controller.getExpense);
router.get('/', controller.getAllExpenses);
router.post('/createExpense', controller.createExpense);
router.patch('/update/:expenseID', controller.updateExpense);
router.delete('/:expenseID', controller.deleteExpense);

export = router;
