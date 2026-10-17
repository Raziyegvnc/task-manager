const express = require("express");
const router = express.Router();
const Task = require("../models/Task.js");
const mongoose = require("mongoose");

const authMiddleware = require("../middleware/authMiddleware.js");

router.get("/test", authMiddleware, async(req, res) => {
    try {
    return res.status(200).json({
    message: "Test başarılı! Yetkilendirme sorunsuz çalışıyor.",
    user: req.user
});
    } catch (error) {
    return res.status(500).json({
    message: "Sunucu hatası",
    error: error.message
});    
    }
});

router.post("/", authMiddleware, async(req, res) => {
    try {
        const title = req.body.title;
        const description = req.body.description;
        const priority = req.body.priority;

        if (!title || title.trim() === "") {
            return res.status(400).json({
            message: "Lütfen görev başlığını girin!"
            });
        }
            const newTask = new Task({ title, description, user: req.user.id, priority });
            await newTask.save();
            return res.status(201).json({
            message: "Görev başarıyla oluşturuldu!!",
            task: newTask});
        
        
    } catch (error) {
        return res.status(500).json({
            message: "Sunucu hatası, görev oluşturulamadı.",
            error: error.message
        });
    }
});

router.get("/", authMiddleware, async(req, res) =>{
    try {
        const tasks = await Task.find({ user: req.user.id });
        return res.status(200).json({ tasks });
    } catch (error) {
    console.error(error);
    return res.status(500).json({
        message: "Görevler getirilemedi."
    });
    }
});

router.put("/:id", authMiddleware, async (req, res) =>{
    try {
        const title = req.body.title;
        const description = req.body.description;
        const completed = req.body.completed;
        const priority = req.body.priority;

        if (title !== undefined && typeof title !== "string") {
            return res.status(400).json({
                message: "Görev başlığı metin olmalıdır."
            });
        }

        if (
            description !== undefined &&
            typeof description !== "string"
        ) {
            return res.status(400).json({
                message: "Görev açıklaması metin olmalıdır."
            });
        }   

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
            message: "Geçersiz görev ID'si."
            });
        }

        if (
            title === undefined &&
            description === undefined &&
            completed === undefined &&
            priority === undefined
        ) {
    return res.status(400).json({
        message: "Güncellenecek en az bir alan gönderilmelidir."
    });
}
        
        if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({
             message: "Geçersiz görev önceliği."
         });
    }

        

        if (title !== undefined){
            if(!title||title.trim() ==="") {
                return res.status(400).json({
                message: "Görev başlığı boş olamaz."
            });
            }
            
        }
        
        if (completed !== undefined && completed !== true && completed !== false) {
            return res.status(400).json({
            message: "Görevin tamamlanma durumu true veya false olmalıdır."
            });
        }

       const updatedTask = await Task.findOneAndUpdate(
    {
        _id: req.params.id,
        user: req.user.id
    },
    {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority })
    },
    {
        new: true,
        runValidators: true
    }
);
        
        if (!updatedTask) {
            return res.status(404).json({
            message: "Görev bulunamadı veya bu görev size ait değil."
            });
        }

        return res.status(200).json({
            message: "Görevler başarıyla güncellendi!.",
            task: updatedTask
        });
 
   } catch (error) {
    console.error(error);
    return res.status(500).json({
        message: "Görev güncellenirken sunucu hatası oluştu."
    });
}
});

router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
            message: "Geçersiz görev ID'si."
            });
        }

        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, 
        user: req.user.id });

        if (!deletedTask) {
            return res.status(404).json({
            message: "Görev bulunamadı veya bu görev size ait değil."
            });
        }

        return res.status(200).json({
            message: "Görevler başarıyla silindi!.",
            task: deletedTask
        });

    } catch (error) {
        return res.status(500).json({
            message: "Görevler silinemedi!."
        });
    }
});

module.exports = router;