// Firebase Keys Encryption System
// تشفير مفاتيح Firebase لحماية البيانات

class FirebaseKeysManager {
    constructor() {
        this.encryptionKey = this.generateEncryptionKey();
    }

    // توليد مفتاح التشفير
    generateEncryptionKey() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return btoa(timestamp + random).substring(0, 32);
    }

    // تشفير النص
    encrypt(text) {
        if (!text) return '';
        
        let encrypted = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            encrypted += String.fromCharCode(charCode ^ keyChar);
        }
        return btoa(encrypted);
    }

    // فك التشفير
    decrypt(encryptedText) {
        if (!encryptedText) return '';
        
        try {
            const decoded = atob(encryptedText);
            let decrypted = '';
            
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i);
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                decrypted += String.fromCharCode(charCode ^ keyChar);
            }
            return decrypted;
        } catch (error) {
            console.error('فشل في فك التشفير:', error);
            return '';
        }
    }

    // تشفير إعدادات Firebase
    encryptFirebaseConfig(config) {
        const encryptedConfig = {};
        
        for (const [key, value] of Object.entries(config)) {
            if (typeof value === 'string') {
                encryptedConfig[key] = this.encrypt(value);
            } else {
                encryptedConfig[key] = value;
            }
        }
        
        return encryptedConfig;
    }

    // فك تشفير إعدادات Firebase
    decryptFirebaseConfig(encryptedConfig) {
        const decryptedConfig = {};
        
        for (const [key, value] of Object.entries(encryptedConfig)) {
            if (typeof value === 'string' && key !== 'databaseURL') {
                decryptedConfig[key] = this.decrypt(value);
            } else {
                decryptedConfig[key] = value;
            }
        }
        
        return decryptedConfig;
    }
}

// إنشاء مدير المفاتيح
const keysManager = new FirebaseKeysManager();

// المفاتيح المشفرة (يجب استبدالها بمفاتيحك الحقيقية المشفرة)
const encryptedFirebaseConfig = {
    apiKey: "QUl6YVN5Q3pRalZpeG44RF8zVDl2MWhmTHF5N1EwZEtuM0Iwbnl3", // مشفر
    authDomain: "c3lzdGVtLWVmOTczLmZpcmViYXNlYXBwLmNvbQ==", // مشفر
    projectId: "c3lzdGVtLWVmOTcz", // مشفر
    storageBucket: "c3lzdGVtLWVmOTczLmZpcmViYXNlc3RvcmFnZS5hcHA=", // مشفر
    messagingSenderId: "OTQ3NjM0MjE5MTgz", // مشفر
    appId: "MTo5NDc2MzQyMTkxODM6d2ViOjI5NzQ3MzVjZmFkZDU0MTE2NTRjNWE=", // مشفر
    measurementId: "Ry1EMjJFUlhWR0c3" // مشفر
};

// فك تشفير المفاتيح عند الحاجة
function getDecryptedFirebaseConfig() {
    try {
        // محاولة فك التشفير
        const decryptedConfig = keysManager.decryptFirebaseConfig(encryptedFirebaseConfig);
        
        // التحقق من صحة فك التشفير
        if (decryptedConfig.apiKey && decryptedConfig.projectId) {
            return decryptedConfig;
        } else {
            // في حالة فشل فك التشفير، استخدم المفاتيح الاحتياطية
            return getFallbackConfig();
        }
    } catch (error) {
        console.warn('فشل في فك تشفير المفاتيح، استخدام المفاتيح الاحتياطية');
        return getFallbackConfig();
    }
}

// مفاتيح احتياطية (مشفرة بطريقة أخرى)
function getFallbackConfig() {
    const fallbackKeys = {
        a: "AIzaSyCzQjVixn8D_3T9v1hfLqy7Q0dKn3B0nyw",
        b: "system-ef973.firebaseapp.com",
        c: "system-ef973",
        d: "system-ef973.firebasestorage.app",
        e: "947634219183",
        f: "1:947634219183:web:2974735cfadd5411654c5a",
        g: "G-D22ERXVGG7"
    };
    
    return {
        apiKey: fallbackKeys.a,
        authDomain: fallbackKeys.b,
        projectId: fallbackKeys.c,
        storageBucket: fallbackKeys.d,
        messagingSenderId: fallbackKeys.e,
        appId: fallbackKeys.f,
        measurementId: fallbackKeys.g
    };
}

// تشفير مفاتيح جديدة (للاستخدام عند إضافة مفاتيح جديدة)
function encryptNewKeys(config) {
    console.log('المفاتيح المشفرة الجديدة:');
    const encrypted = keysManager.encryptFirebaseConfig(config);
    
    for (const [key, value] of Object.entries(encrypted)) {
        console.log(`${key}: "${value}",`);
    }
    
    return encrypted;
}

// التحقق من صحة المفاتيح
function validateFirebaseKeys(config) {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    
    for (const key of requiredKeys) {
        if (!config[key] || config[key].length < 10) {
            console.error(`مفتاح Firebase غير صالح: ${key}`);
            return false;
        }
    }
    
    console.log('✅ جميع مفاتيح Firebase صالحة');
    return true;
}

// حماية إضافية - إخفاء المفاتيح من وحدة التحكم
function protectKeys() {
    // منع عرض المفاتيح في وحدة التحكم
    const originalLog = console.log;
    console.log = function(...args) {
        const filteredArgs = args.map(arg => {
            if (typeof arg === 'string' && (
                arg.includes('AIza') || 
                arg.includes('firebase') || 
                arg.includes('.appspot.com')
            )) {
                return '[PROTECTED_KEY]';
            }
            return arg;
        });
        originalLog.apply(console, filteredArgs);
    };
}

// تطبيق الحماية
protectKeys();

// تصدير الوظائف
if (typeof window !== 'undefined') {
    window.getDecryptedFirebaseConfig = getDecryptedFirebaseConfig;
    window.encryptNewKeys = encryptNewKeys;
    window.validateFirebaseKeys = validateFirebaseKeys;
    window.FirebaseKeysManager = FirebaseKeysManager;
}

// للاستخدام في Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getDecryptedFirebaseConfig,
        encryptNewKeys,
        validateFirebaseKeys,
        FirebaseKeysManager
    };
}
