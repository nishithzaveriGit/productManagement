import express from "express";
// import http from 'http';
import morgan from "morgan";

import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import connectDb from "./config/db.js";
import productsRoute from "./api/routes/products.js";

dotenv.config();

const port = process.env.PORT || 5100;

const app = express();

// middlewares
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));
app.use(express.json());

// db connection
connectDb();

// const server = http.createServer(app);

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// routes
app.use("/products", productsRoute);

// Not found
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// error handles
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
