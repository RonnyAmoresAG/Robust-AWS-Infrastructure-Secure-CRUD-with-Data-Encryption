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

// Función para descifrar datos
const decryptData = (encryptedData, iv, encryptionKey) => {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

export const handler = async (event) => {
    const { id } = JSON.parse(event.body);
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

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT id, name, address, phone, iv_name, iv_address, iv_phone FROM customer WHERE id = ?', [id]);
        await connection.end();

        if (rows.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Registro no encontrado'
                })
            };
        }

        const row = rows[0];
        console.log('Row:', row);

        const decryptedName = decryptData(row.name, row.iv_name, encryptionKey);
        const decryptedAddress = decryptData(row.address, row.iv_address, encryptionKey);
        const decryptedPhone = decryptData(row.phone, row.iv_phone, encryptionKey);

        console.log('Decrypted Name:', decryptedName);
        console.log('Decrypted Address:', decryptedAddress);
        console.log('Decrypted Phone:', decryptedPhone);

        const decryptedData = {
            id: row.id,
            name: decryptedName,
            address: decryptedAddress,
            phone: decryptedPhone
        };

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Datos descifrados correctamente',
                data: decryptedData
            })
        };
    } catch (error) {
        console.error('Error al leer los datos:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error al leer los datos',
                error: error.message
            })
        };
    }
};
