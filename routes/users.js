const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { authorization } = require("../middleware/auth");

// GET ALL USERS
router.get("/users", authorization, (req, res) => {
    const { limit, page } = req.query;

    let totalLimit = limit ? +limit : "";
    let totalPage = page ? +page : "";

    const allUser = `
        SELECT * FROM users ORDER BY id
        LIMIT ${totalLimit} OFFSET ${(totalPage - 1) * totalLimit} 
    `;

    pool.query(allUser, authorization, (err, result) => {
        if (err) throw err;

        res.status(200).json(result.rows);
    });
});

// GET USER BY ID
router.get("/users/:id", authorization, (req, res) => {
    const { id } = req.params;

    const userById = `SELECT * FROM users WHERE id = $1;`;
    pool.query(userById, [id], (err, result) => {
        if (err) throw err;
        if (result.rows[0]) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({
                message: "User not found",
            });
        }
    });
});

// CREATE NEW USER
router.post("/users/", authorization, (req, res) => {
    const { email, gender, password, role } = req.body;
    const createUser = `INSERT INTO users (email,gender,password,role)
                            VALUES
                                ($1,$2,$3,$4)`;

    if (email && gender && password && role) {
        pool.query(createUser, [email, gender, password, role], (err, result) => {
            if (err) throw err;
            res.status(201).json({
                message: "New user created Successfully.",
            });
        });
    } else {
        res.status(400).json({
            message: "Create new User failed.",
        });
    }
});

// UPDATE USER
router.put("/users/:id", authorization, (req, res) => {
    const { email, gender, password, role } = req.body;
    const { id } = req.params;

    const updateUser = `
        UPDATE users
            SET
            email = $1,
            gender = $2,
            password = $3,
            role = $4
                WHERE id = $5`;

    if (email && gender && password && role) {
        pool.query(updateUser, [email, gender, password, role, id], (err, result) => {
            if (err) throw err;
            res.status(200).json({
                message: `User id ${id} updated successfully.`,
            });
        });
    } else {
        res.json({
            message: "User update failed",
        });
    }
});

// DELETE USER
router.delete("/users/:id", authorization, (req, res) => {
    const { id } = req.params;
    const findUser = `SELECT * FROM users WHERE id = $1`;

    pool.query(findUser, [id], (err, result) => {
        if (result.rows[0]) {
            const deleteUser = `DELETE FROM users WHERE id = $1`;

            pool.query(deleteUser, [id], (err, result) => {
                if (err) throw err;

                res.status(200).json({
                    message: `User Id ${id} Deleted successfully`,
                });
            });
        } else {
            res.status(404).json({
                message: "User not found",
            });
        }
    });
});

module.exports = router;
