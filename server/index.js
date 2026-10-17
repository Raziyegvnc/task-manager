const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
const mongoUri = process.env.MONGO_URI;
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const taskRoutes = require("./routes/taskRoutes.js");
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 5000;

async function connectDB(){
    try {
        await mongoose.connect(mongoUri);
        console.log("Bağlantı kuruldu...");
        app.listen(PORT, () => {
            console.log(`Sunucu ${PORT} portunda çalışıyor...`);
});
    } catch (error) {
        console.error("Bağlantı hatası:", error.message);
    }
}

connectDB();


app.get('/', (req,res) =>{
    res.send("API çalışıyor");
})

