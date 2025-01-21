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

        res.status(200).json({totalAmount, data})
    }
    catch {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
}


const createFinance = async (req, res) => {
    const { title, amount, type } = req.body;

    if (!title || !amount || !type) return res.status(400).json({ message: 'Semua field harus diisi' });

    try {
        const finance = await Finance.create({
            user: req.user.id,
            title,
            amount,
            type,
        });

        res.status(201).json(finance);
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

module.exports = { getFinances, createFinance, updateFinance, deleteFinance, financeReport };