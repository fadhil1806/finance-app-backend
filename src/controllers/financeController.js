const Finance = require('../models/financeModel');

const getFinances = async (req, res) => {
    try {
        const finances = await Finance.find({ user: req.user.id });
        res.status(200).json(finances);
    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

const financeReport = async (req, res) => {
    try {
        const { id } = req.params
        const { start_date, end_date, type } = req.query

        let filter = { user: id };

        if (start_date) filter.createdAt = { ...filter.createdAt, $gte: new Date(start_date.split('-').reverse().join('-')) };
        if (end_date) filter.createdAt = { ...filter.createdAt, $lte: new Date(end_date.split('-').reverse().join('-')) };

        if (type) filter.type = type;

        const data = await Finance.find(filter)
            .select('-createdAt -updatedAt -user -__v')

        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

        res.status(200).json({ totalAmount, data })
    }
    catch {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
}


const createFinance = async (req, res) => {
    const { title, amount, type, category } = req.body;

    if (!title || !amount || !type || !category) return res.status(400).json({ message: 'Semua field harus diisi' });

    if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'Tipe harus income atau expense' });

    if (!['salary', 'education', 'health', 'food', 'transportation', 'entertainment', 'utilities', 'others'].includes(category)) {
        return res.status(400).json({ message: 'Kategori harus salary, food, transportation, entertainment, utilities, others' });
    }

    try {
        await Finance.create({
            user: req.user.id,
            title,
            amount,
            type,
            category
        });

        res.status(201).json({ message: "Success add Data Finance" });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat data finance' });
    }
};


const updateFinance = async (req, res) => {
    const { id } = req.params;

    try {
        const finance = await Finance.findById(id);

        if (!finance || finance.user.toString() !== req.user.id) return res.status(404).json({ message: 'Data tidak ditemukan' });

        const updatedFinance = await Finance.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedFinance);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengupdate data finance' });
    }
};


const deleteFinance = async (req, res) => {
    const { id } = req.params;

    try {
        const finance = await Finance.findById(id);

        if (!finance || finance.user.toString() !== req.user.id) return res.status(404).json({ message: 'Data tidak ditemukan' });

        await finance.deleteOne({ _id: id });
        res.status(200).json({ message: 'Data berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus data finance' });
    }
};

const getFinanceSummary = async (req, res) => {
    try {
        const { id } = req.params;

        const finances = await Finance.find({ user: id });

        // Hitung total pemasukan, pengeluaran, dan saldo
        const totalIncome = finances
            .filter((item) => item.type === 'income')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const totalExpense = finances
            .filter((item) => item.type === 'expense')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const balance = totalIncome - totalExpense;

        res.status(200).json({
            totalIncome,
            totalExpense,
            balance,
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
};

const getCategoryStats = async (req, res) => {
    try {
        const { id } = req.params;

        const finances = await Finance.find({ user: id });

        // Kelompokkan data berdasarkan kategori
        const categoryStats = finances.reduce((acc, curr) => {
            if (!acc[curr.category]) {
                acc[curr.category] = { total: 0, count: 0 };
            }
            acc[curr.category].total += curr.amount;
            acc[curr.category].count += 1;
            return acc;
        }, {});

        res.status(200).json(categoryStats);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mendapatkan statistik kategori' });
    }
};

const getMonthlyStats = async (req, res) => {
    try {
        const { year } = req.query; // Ambil tahun dari query parameter

        if (!year) {
            return res.status(400).json({ message: 'Tahun harus disertakan dalam query parameter.' });
        }

        // Filter data berdasarkan tahun
        const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
        const endOfYear = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);

        const finances = await Finance.find({
            user: req.params.id,
            createdAt: { $gte: startOfYear, $lt: endOfYear },
        });

        // Hitung statistik bulanan
        const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
        }));

        finances.forEach((item) => {
            const monthIndex = item.createdAt.getUTCMonth(); // Dapatkan bulan (0-11)
            if (item.type === 'income') {
                monthlyStats[monthIndex].totalIncome += item.amount;
            } else if (item.type === 'expense') {
                monthlyStats[monthIndex].totalExpense += item.amount;
            }
            monthlyStats[monthIndex].balance =
                monthlyStats[monthIndex].totalIncome - monthlyStats[monthIndex].totalExpense;
        });

        res.status(200).json(monthlyStats);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


const filterFinance = async (req, res) => {
  try {
    ;
    const { type, month, year, keyword, category, minAmount, maxAmount, startDate, endDate } = req.query;

    let query = { user: req.params.id };

    if (type) query.type = type;
    if (category) query.category = category;

    // Filter berdasarkan jumlah uang
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    // Filter berdasarkan kata kunci di title atau category
    if (keyword) {
      query.$or = [
        { title: new RegExp(keyword, 'i') },
        { category: new RegExp(keyword, 'i') },
      ];
    }

    // Filter berdasarkan rentang tanggal
    if (startDate || endDate || year || month) {
      query.createdAt = {};
      
      if (year) {
        query.createdAt.$gte = new Date(`${year}-01-01T00:00:00.000Z`);
        query.createdAt.$lt = new Date(`${Number(year) + 1}-01-01T00:00:00.000Z`);
      }

      if (month) {
        const yearValue = year || new Date().getFullYear();
        const monthStart = new Date(`${yearValue}-${String(month).padStart(2, '0')}-01T00:00:00.000Z`);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        query.createdAt.$gte = monthStart;
        query.createdAt.$lt = monthEnd;
      }

      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const finances = await Finance.find(query).sort({ createdAt: -1 });

    res.status(200).json(finances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getFinances, createFinance, updateFinance, deleteFinance,financeReport, 
    getFinanceSummary, getCategoryStats, getMonthlyStats, filterFinance
};