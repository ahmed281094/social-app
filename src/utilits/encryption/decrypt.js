import  CryptoJS  from 'crypto-js';

export const Decrypt = async ({key,SECERET_KEY=process.env.SECERET_KEY})=>{
    return CryptoJS.AES.decrypt(key, SECERET_KEY).toString(CryptoJS.enc.Utf8);
}