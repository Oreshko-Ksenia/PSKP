exports.getAllUsers = (req, res) => {
    res.status(200).json({ message: "Все пользователи", method: req.method });
};

exports.getUserById = (req, res) => {
    const { id } = req.params;
    res.status(200).json({ message: `Пользователь с ID: ${id}`, method: req.method });
};

exports.createUser = (req, res) => {
    const userData = req.body;
    res.status(201).json({ message: "Пользователь создан", data: userData, method: req.method });
};

exports.updateUser = (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    res.status(200).json({ message: `Пользователь с ID: ${id} обновлен`, data: updateData, method: req.method });
};

exports.deleteUser = (req, res) => {
    const { id } = req.params;
    res.status(200).json({ message: `Пользователь с ID: ${id} удален`, method: req.method });
};