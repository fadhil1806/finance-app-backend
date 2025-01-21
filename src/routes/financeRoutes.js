const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  financeReport,
} = require('../controllers/financeController');

router.get('/', protect, getFinances);
router.get('/:id', financeReport)
router.post('/', protect, createFinance);
router.put('/:id', protect, updateFinance);
router.delete('/:id', protect, deleteFinance);

module.exports = router;