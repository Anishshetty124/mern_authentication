import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectdb from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';

const app=express();
const PORT=process.env.PORT || 4000;
connectdb();
app.use(express.json());
app.use(cookieParser());//cookie-parser is a middleware for Express that parses 
// cookies from the HTTP Request headers and makes them accessible via req.cookies.

app.use(cors({credentials: true}))// cred:true if you need to send cookies/auth headers
//By default, browsers block cross-origin HTTP requests initiated from scripts
//For example, if your frontend runs on http://localhost:5173 and 
// your backend API i/s on http://localhost:5000, the browser considers
//  them different origins and blocks requests unless CORS is properly configured.

app.get('/', (req, res) => {
    res.send('Hello from server');
});
app.use('/api/auth', authRouter);
// 📌 Why we use app.use('/api/auth', authRouter):
// ------------------------------------------------------
// This means: "For every route that starts with /api/auth,
// go and look inside the authRouter file for what to do."

// For example:
// If authRouter has a route like: router.post('/login')
// Then this becomes: POST request to /api/auth/login

// 👉 /api is used to show this is a backend API.
// 👉 /auth means this part is for authentication (login/register).

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

