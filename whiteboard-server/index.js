const Express=require('express');
const app=Express();
const connectDB=require('./db');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());
app.use("/auth",require("./modules/auth"))
app.use("/room",require("./modules/room"))
app.listen(5000,()=>{
    console.log("Server Started on 5000");
})