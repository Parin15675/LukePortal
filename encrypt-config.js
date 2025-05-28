const CryptoJS = require("crypto-js");
const fs = require("fs");
require('dotenv').config(); 

const PASS_ENCRYPT = process.env.ENCRYPT_KEY ?? ''; // Store securely
const inputFilePath = "src/environments/configuration.json"; // ✅ Original config file
const outputFilePath = "src/assets/env/configuration.enc.json"; // ✅ Encrypted file location

if (!fs.existsSync(inputFilePath)) {
    console.error("configuration.json not found! Ensure it exists in src/assets/");
    process.exit(1);
}

// Read environment.json
const envData = fs.readFileSync(inputFilePath, "utf-8");

// Encrypt data using AES-256
const encrypted = CryptoJS.AES.encrypt(envData, PASS_ENCRYPT).toString();

// Save encrypted data to a new file
fs.writeFileSync(outputFilePath, JSON.stringify({ data: encrypted }, null, 2));

console.log("✅ Environment file encrypted successfully:", outputFilePath);
