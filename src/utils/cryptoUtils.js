import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env?.VITE_ENCRYPTION_KEY || "gym_crm_secure_internal_key_2026";

/**
 * Encrypts a string or object
 * @param {any} data - Data to encrypt. Object will be JSON stringified.
 * @returns {string} - Encrypted string
 */
export const encryptData = (data) => {
    try {
        const stringData = typeof data === "object" ? JSON.stringify(data) : String(data);
        return CryptoJS.AES.encrypt(stringData, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption failed:", error);
        return null;
    }
};

/**
 * Decrypts a string back to original format
 * @param {string} encryptedData - Encrypted string to decrypt
 * @param {boolean} isObject - Set to true if original data was an object/JSON
 * @returns {any} - Decrypted data
 */
export const decryptData = (encryptedData, isObject = false) => {
    if (!encryptedData) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) return null;

        return isObject ? JSON.parse(decryptedString) : decryptedString;
    } catch (error) {
        console.error("Decryption failed:", error);
        return null;
    }
};
