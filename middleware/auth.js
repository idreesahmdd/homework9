const jwt = require("jsonwebtoken");
const secret = "PasswordRahasia";
const pool = require("../config/db");

const authentication = (req, res, next) => {
    const { access_token } = req.headers;

    if (access_token) {
        try {
            const decoded = jwt.verify(access_token, secret);

            const { id } = decoded;
            const findUser = `
                SELECT * FROM users WHERE id = $1
            `;

            pool.query(findUser, [id], (err, result) => {
                if (err) throw err;

                if (result.rows.length === 0) {
                    res.status(404).json({
                        message: "User not found",
                    });
                } else {
                    const user = result.rows[0];
                    req.userLogin = {
                        id: user.id,
                        email: user.email,
                        gender: user.gender,
                        role: user.role,
                    };

                    next();
                }
            });
        } catch (err) {
            res.status(400).json({
                message: "Invalid Access Key / JWT",
            });
        }
    } else {
        res.status(400).json({
            message: "Invalid Authentication",
        });
    }
};

const authorization = (req, res, next) => {
    const { role } = req.userLogin;

    if (role === "Admin") {
        next();
    } else {
        res.status(401).json({
            message: "Invalid Authorization",
        });
    }
};

module.exports = {
    authentication,
    authorization,
};
