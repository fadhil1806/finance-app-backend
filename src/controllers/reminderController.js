const Reminder = require('../models/reminderModel');

const handleServerError = (res, message = 'Terjadi kesalahan server') =>
    res.status(500).json({ message });

const getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ user: req.user.id });
        res.status(200).json(reminders);
    } catch {
        handleServerError(res);
    }
};

const createReminder = async (req, res) => {
    const { title, amount, dueDate } = req.body;
    if (!title || !amount || !dueDate) {
        return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    try {
        const reminder = await Reminder.create({ user: req.user.id, title, amount, dueDate });
        res.status(201).json(reminder);
    } catch {
        handleServerError(res, 'Gagal membuat reminder');
    }
};

const updateReminderStatus = async (req, res) => {
    try {
        const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user.id });
        if (!reminder) return res.status(404).json({ message: 'Reminder tidak ditemukan' });

        reminder.isPaid = !reminder.isPaid;
        await reminder.save();
        res.status(200).json(reminder);
    } catch {
        handleServerError(res, 'Gagal mengupdate status reminder');
    }
};

const deleteReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!reminder) return res.status(404).json({ message: 'Reminder tidak ditemukan' });

        res.status(200).json({ message: 'Reminder berhasil dihapus' });
    } catch {
        handleServerError(res, 'Gagal menghapus reminder');
    }
};

module.exports = { getReminders, createReminder, updateReminderStatus, deleteReminder };
