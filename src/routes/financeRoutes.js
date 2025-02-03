const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  financeReport,
  getFinanceSummary,
  getCategoryStats,
  getMonthlyStats,
  filterFinance
} = require('../controllers/financeController');

router.route('/').get(protect, getFinances).post(protect, createFinance);

router.route('/:id').get(financeReport).put(protect, updateFinance).delete(protect, deleteFinance);

// router.get('/:id', financeReport)
// router.put('/:id', protect, updateFinance);
// router.delete('/:id', protect, deleteFinance);

router.get('/summary/:id', getFinanceSummary);
router.get('/category-stats/:id', getCategoryStats);

router.get('/filter/:id', filterFinance);
router.get('/:id/monthly-stats', protect, getMonthlyStats);


module.exports = router;