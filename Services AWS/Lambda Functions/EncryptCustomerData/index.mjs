import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Configuración de la base de datos
const dbConfig = {
    host: 'ARN DATABASE',
    user: 'admin',
    password: 'put password ',
    port: 3306,
    database: 'namedatabase'
};

// Función para cifrar datos
const encryptData = (data, encryptionKey) => {
    const iv = crypto.randomBytes(16); // Vector de inicialización de 16 bytes
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
};

export const handler = async (event) => {
    const { name, address, phone } = JSON.parse(event.body);
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Clave de cifrado no configurada en variables de entorno'
            })
        };
    }

    console.log('Encryption Key:', encryptionKey);

    const encryptedName = encryptData(name, encryptionKey);
    const encryptedAddress = encryptData(address, encryptionKey);
    const encryptedPhone = encryptData(phone, encryptionKey);

    console.log('Encrypted Name:', encryptedName);
    console.log('Encrypted Address:', encryptedAddress);
    console.log('Encrypted Phone:', encryptedPhone);

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            'INSERT INTO customer (name, address, phone, iv_name, iv_address, iv_phone) VALUES (?, ?, ?, ?, ?, ?)', 
            [encryptedName.encryptedData, encryptedAddress.encryptedData, encryptedPhone.encryptedData, encryptedName.iv, encryptedAddress.iv, encryptedPhone.iv]
        );
        await connection.end();

        return {
            statusCode: 200,
            body: JSON.stringify({
                name: encryptedName.encryptedData,
                address: encryptedAddress.encryptedData,
                phone: encryptedPhone.encryptedData,
                iv_name: encryptedName.iv,
                iv_address: encryptedAddress.iv,
                iv_phone: encryptedPhone.iv
            })
        };
    } catch (error) {
        console.error('Error al almacenar los datos:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error al almacenar los datos',
                error: error.message
            })
        };
    }
};
