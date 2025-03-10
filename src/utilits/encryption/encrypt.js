import CryptoJS from 'crypto-js';


export const Encrypt = async ({ key, SECERET_KEY = process.env.SECERET_KEY }) => {
    return CryptoJS.AES.encrypt(key, SECERET_KEY).toString()
}