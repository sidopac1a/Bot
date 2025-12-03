const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'لا يوجد رمز مصادقة، الوصول مرفوض'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'انتهت صلاحية رمز المصادقة'
            });
        }
        
        return res.status(401).json({
            success: false,
            error: 'رمز المصادقة غير صالح'
        });
    }
};

module.exports = auth;