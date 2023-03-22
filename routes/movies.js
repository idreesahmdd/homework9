const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const {authorization} = require("../middleware/auth");

// GET ALL MOVIES
router.get("/movies", (req, res) => {
    const {limit, page} = req.query;

    let totalLimit = limit ? +limit : "10";
    console.log(totalLimit);
    let totalPage = page ? +page : "1";

    const allMovies = ` 
        SELECT * FROM movies ORDER BY id
        LIMIT ${totalLimit} OFFSET ${(totalPage - 1) * totalLimit} 
    `;

    pool.query(allMovies, (err, result) => {
        if (err) throw err;
        res.status(200).json(result.rows);
    });
});

// GET MOVIE BY ID
router.get("/movies/:id", (req, res) => {
    const {id} = req.params;

    const movieById = `SELECT * FROM movies WHERE id = $1`;

    pool.query(movieById, [id], (err, result) => {
        if (err) throw err;
        if (result.rows[0]) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({
                message: "Movie not Found",
            });
        }
    });
});

// CREATE NEW MOVIE
router.post("/movies", authorization, (req, res) => {
    const {title, genres, year} = req.body;
    const createMovie = `INSERT INTO movies (title,genres,year)
                            VALUES
                                ($1,$2,$3)`;

    if (title && genres && year) {
        pool.query(createMovie, [title, genres, year], (err, result) => {
            if (err) throw err;
            res.status(201).json({
                message: "New movie created successfully.",
            });
        });
    } else {
        res.status(400).json({
            message: "Create new movie failed.",
        });
    }
});

// UPDATE MOVIE
router.put("/movies/:id", authorization, (req, res) => {
    const {title, genres, year} = req.body;
    const {id} = req.params;

    const updateMovie = `
        UPDATE movies 
            SET 
            title = $1,
            genres = $2,
            year = $3
                WHERE id = $4`;

    if (title && genres && year) {
        pool.query(updateMovie, [title, genres, year, id], (err, result) => {
            if (err) throw err;
            res.status(200).json({
                message: `Movie id ${id} updated successfully.`,
            });
        });
    } else {
        res.status(400).json({
            message: "Movie update Failed",
        });
    }
});

// DELETE MOVIE
router.delete("/movies/:id", authorization, (req, res) => {
    const {id} = req.params;

    const findMovie = `SELECT * FROM movies WHERE id = $1`;
    pool.query(findMovie, [id], (err, result) => {
        if (err) throw err;

        if (result.rows[0]) {
            const deleteMovie = `DELETE FROM movies WHERE id = $1`;
            pool.query(deleteMovie, [id], (err, result) => {
                if (err) throw err;
                res.status(200).json({
                    message: `Movie Id ${id} Deleted successfully`,
                });
            });
        } else {
            res.status(404).json({
                message: "Movie not found",
            });
        }
    });
});

module.exports = router;
