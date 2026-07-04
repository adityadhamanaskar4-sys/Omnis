const Express=require('express');
const app=Express();
const connectDB=require('./db');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
connectDB();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
app.use("/auth",require("./auth/auth"))
app.listen(5000,()=>{
    console.log("Server Started on 5000");
})