const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
} = require('../controllers/financeController');

router.get('/', protect, getFinances);
router.post('/', protect, createFinance);
router.put('/:id', protect, updateFinance);
router.delete('/:id', protect, deleteFinance);

module.exports = router;