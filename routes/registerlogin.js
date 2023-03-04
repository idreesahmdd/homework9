const express = require("express");
const router = express.Router();
const moviesRoute = require("./movies");
const usersRoute = require("./users");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");
const secret = "PasswordRahasia";
const { authentication } = require("../middleware/auth");

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const findUser = `SELECT * FROM users WHERE email = $1`;

    pool.query(findUser, [email], (err, result) => {
        if (err) throw err;

        if (result.rows.length === 0) {
            res.status(404).json({
                message: `User email "${email}" not found`,
            });
        } else {
            const data = result.rows[0];

            const compPass = bcrypt.compareSync(password, data.password);

            if (compPass) {
                const accessToken = jwt.sign(
                    {
                        id: data.id,
                        email: data.email,
                        gender: data.gender,
                        role: data.role,
                    },
                    secret
                );

                res.status(200).json({
                    id: data.id,
                    email: data.email,
                    gender: data.gender,
                    role: data.role,
                    accessToken: accessToken,
                });
            } else {
                res.status(400).json({
                    message: "Wrong password",
                });
            }
        }
    });
});

router.post("/register", (req, res) => {
    const { email, gender, password, role } = req.body;

    const hash = bcrypt.hashSync(password, salt);

    const register = `
        INSERT INTO users (email,gender,password,role)
            VALUES 
            ($1,$2,$3,$4)
    `;

    if (email && gender && hash && role) {
        pool.query(register, [email, gender, hash, role], (err, result) => {
            if (err) throw err;

            res.status(201).json({
                message: "User register success",
            });
        });
    } else {
        res.status(400).json({
            message: "User register failed",
        });
    }
});

// AUTHENTICATION & AUTHORIZATION
router.use(authentication);

//  ROUTES MOVIES
router.use(moviesRoute);

//  ROUTES USERS
router.use(usersRoute);

module.exports = router;
