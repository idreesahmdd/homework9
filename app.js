const express = require("express");
const app = express();
const port = 3000;
const route = require("./routes/registerlogin");
const morgan = require("morgan");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan(`tiny`));

// SWAGGER
const swaggerUi = require("swagger-ui-express");
const movieDocs = require("./swagger/Movie-Docs.json");
app.use("/movie-docs", swaggerUi.serve, swaggerUi.setup(movieDocs));

// ROUTES
app.use(route);

app.listen(port, () => {
    console.log(`Server berjalan di Port ${port}`);
});
