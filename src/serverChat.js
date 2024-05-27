const socketIo = require('socket.io');


function serverChat(app, PORT) {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const io = socketIo(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000'], // Lista de orígenes permitidos
            methods: ['GET', 'POST'] // Métodos permitidos para la solicitud CORS
        }
    });

    // Configurar Socket.io para escuchar eventos de conexión
    io.on('connection', (socket) => {
        console.log('Usuario conectado');

        // Manejar eventos de chat
        socket.on('chat message', (msg) => {
            console.log('Mensaje: ' + msg.text);
            // Aquí puedes guardar el mensaje en la base de datos o transmitirlo a otros usuarios
            io.emit('chat message', msg);
        });

        // Manejar eventos de desconexión
        socket.on('disconnect', () => {
            console.log('Usuario desconectado');
        });
    });
}

module.exports = serverChat;
