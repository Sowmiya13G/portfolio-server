import CryptoJS from "crypto-js";

const key = process.env.ENCRYPTION_SECRET;

export function encryptText(text) {
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decryptText(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}
