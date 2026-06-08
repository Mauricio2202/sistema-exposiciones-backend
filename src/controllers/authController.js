export const login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Intentando login para usuario: ${username} con password: ${password}`);

    try {
        const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);

        if (rows.length === 0) {
            console.log('Usuario no encontrado en la base de datos');
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = rows[0];
        console.log('Usuario encontrado en BD:', user.username);
        console.log('Password en BD:', user.password);

        if (password === user.password) {
            console.log('¡Login exitoso!');
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secreto', { expiresIn: '1h' });
            return res.json({ token, message: 'Login exitoso' });
        } else {
            console.log('Fallo de contraseña: La contraseña enviada no coincide con la BD');
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error interno' });
    }
};