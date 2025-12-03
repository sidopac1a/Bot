const { body, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'بيانات غير صالحة',
            details: errors.array()
        });
    }
    next();
};

const messageValidation = [
    body('to')
        .notEmpty()
        .withMessage('رقم المستقبل مطلوب')
        .isMobilePhone()
        .withMessage('رقم الهاتف غير صالح'),
    body('message')
        .notEmpty()
        .withMessage('نص الرسالة مطلوب')
        .isLength({ min: 1, max: 4096 })
        .withMessage('نص الرسالة يجب أن يكون بين 1 و 4096 حرف')
];

const settingsValidation = [
    body('category')
        .notEmpty()
        .withMessage('فئة الإعدادات مطلوبة')
        .isIn(['whatsapp', 'ai', 'general'])
        .withMessage('فئة الإعدادات غير صالحة'),
    body('settings')
        .isObject()
        .withMessage('يجب أن تكون الإعدادات كائن')
];

module.exports = {
    validateRequest,
    messageValidation,
    settingsValidation
};