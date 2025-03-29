
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SERVICEM8_INBOX_EMAIL = process.env.SERVICEM8_INBOX_EMAIL;

// Configure Multer for file uploads (memory storage for nodemailer attachments)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Handle form submissions with potential file uploads
app.post("/api/send-inquiry", upload.fields([
    { name: "existingSwitchImage", maxCount: 1 },
    { name: "switchBoardImage", maxCount: 1 }
]), async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            mobile,
            email,
            address,
            description,
            jobType
        } = req.body;

        if (!firstName || !lastName || !mobile || !address || !description || !jobType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const mailContent = `
Online Enquiry
Online enquiry from ${firstName} ${lastName}.

Company: ${firstName} ${lastName}
First Name: ${firstName}
Last Name: ${lastName}
Email: ${email || "Not Provided"}
Mobile: ${mobile}
Address: ${address}
Description: ${description}
Status: ${jobType}
`;


        const attachments = [];
        if (req.files["existingSwitchImage"]) {
            const file = req.files["existingSwitchImage"][0];
            attachments.push({
                filename: "ExistingSwitchSystem.jpg",
                content: file.buffer
            });
        }

        if (req.files["switchBoardImage"]) {
            const file = req.files["switchBoardImage"][0];
            attachments.push({
                filename: "SwitchBoard.jpg",
                content: file.buffer
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: SERVICEM8_INBOX_EMAIL,
            subject: `Online Enquiry from ${firstName} ${lastName}`,
            text: mailContent,
            attachments
        };

        await transporter.sendMail(mailOptions);

        console.log("✅ Enquiry with attachments sent to ServiceM8 Inbox!");
        res.json({ message: "Enquiry successfully sent to Climate Co!" });

    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
