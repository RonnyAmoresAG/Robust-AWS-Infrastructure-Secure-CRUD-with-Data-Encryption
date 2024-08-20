const axios = require('axios');

const controller = {};

controller.list = (req, res) => {
    req.getConnection((err, conn) => {
        if (err) {
            console.error('Error de conexión a la base de datos:', err);
            res.status(500).send('Error de conexión a la base de datos');
            return;
        }

        conn.query('SELECT * FROM customer', (err, customers) => {
            if (err) {
                console.error('Error al obtener clientes:', err);
                res.status(500).send('Error al obtener clientes');
                return;
            }
            res.render('customers', {
                data: customers
            });
        });
    });
};

controller.save = async (req, res) => {
    const data = req.body;
    console.log('Datos recibidos del formulario:', data);

    try {
        const response = await axios.post('https://k0jhssml0b.execute-api.us-east-1.amazonaws.com/PRODUCCION/encrypt', data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Respuesta de API Gateway:', response.data);

        if (!response.data.name || !response.data.address || !response.data.phone || !response.data.iv_name || !response.data.iv_address || !response.data.iv_phone) {
            console.error('Datos cifrados incompletos o error en la respuesta:', response.data);
            res.status(500).send('Error en los datos cifrados');
            return;
        }

        res.redirect('/');
    } catch (error) {
        console.error('Error al enviar datos a la API Gateway:', error);
        res.status(500).send('Error al enviar datos a la API Gateway');
    }
};

controller.edit = async (req, res) => {
    const { id } = req.params;

    try {
        const response = await axios.post('https://k0jhssml0b.execute-api.us-east-1.amazonaws.com/PRODUCCION/decrypt', { id }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 && response.data.data) {
            res.render('customers_edit', {
                data: response.data.data
            });
        } else {
            console.error('Error al desencriptar los datos:', response.data);
            res.status(500).send('Error al desencriptar los datos');
        }
    } catch (error) {
        console.error('Error al enviar datos a la API Gateway para desencriptar:', error);
        res.status(500).send('Error al enviar datos a la API Gateway para desencriptar');
    }
};

controller.update = async (req, res) => {
    const { id } = req.params;
    const newCustomer = req.body;

    try {
        const response = await axios.post('https://k0jhssml0b.execute-api.us-east-1.amazonaws.com/PRODUCCION/update', { id, ...newCustomer }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_GATEWAY_TOKEN}` // Añadir el token de autenticación aquí si es necesario
            }
        });

        if (response.status === 200) {
            res.redirect('/');
        } else {
            console.error('Error al actualizar y cifrar los datos:', response.data);
            res.status(500).send('Error al actualizar y cifrar los datos');
        }
    } catch (error) {
        console.error('Error al enviar datos a la API Gateway para actualizar:', error);
        res.status(500).send('Error al enviar datos a la API Gateway para actualizar');
    }
};

controller.delete = (req, res) => {
    const { id } = req.params;
    req.getConnection((err, connection) => {
        if (err) {
            console.error('Error de conexión a la base de datos:', err);
            res.status(500).send('Error de conexión a la base de datos');
            return;
        }

        connection.query('DELETE FROM customer WHERE id = ?', [id], (err, rows) => {
            if (err) {
                console.error('Error al eliminar datos en la base de datos:', err);
                res.status(500).send('Error al eliminar datos en la base de datos');
                return;
            }
            res.redirect('/');
        });
    });
};

module.exports = controller;
