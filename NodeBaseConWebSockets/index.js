// Importo las librerías necesarias
const express = require('express');                        // Para el manejo del web server
const bodyParser = require('body-parser');                 // Para parsear JSON
const MySQL = require('./modulos/mysql');                  // Archivo mysql.js en la carpeta módulos
const session = require('express-session');                // Para el manejo de variables de sesión
const socketIO = require('socket.io');                     // Para trabajar con websockets

// Inicializo la app de Express
const app = express();

// Configuración del puerto
const LISTEN_PORT = 4000;                                  // Puerto donde corre el servidor

// Middleware para el manejo de datos JSON y URL-encoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración de sesión
const sessionMiddleware = session({
    secret: "supersarasa", // Cambia esta clave secreta por una más segura en producción
    resave: false,
    saveUninitialized: false
});
app.use(sessionMiddleware);

// Inicia el servidor
const server = app.listen(LISTEN_PORT, () => {
    console.log(`Servidor NodeJS corriendo en http://localhost:${LISTEN_PORT}/`);
});

// Configuración de Socket.IO con CORS
const io = socketIO(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"], // Permitir origenes específicos
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Usar sesión en los sockets
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// Variables de color y turno
var coloresDisponibles = ["negro", "blanco"];
var turnoDe = "blanco";

// Configuración de eventos de Socket.IO
io.on("connection", (socket) => {
    const req = socket.request;

    socket.on('partida', data => {
        console.log("Se conectó alguien", data);
        req.session.color = coloresDisponibles.pop();
        socket.emit('colorAsignado', { color: req.session.color });
    });

    socket.on('hacerMovimiento', data => {
        console.log("hacerMovimiento:", data);
        turnoDe = (turnoDe === "blanco") ? "negro" : "blanco"; // Alternar turno
        io.emit('recibirMovimiento', { board: data.board, turnoDe: turnoDe });
    });

    socket.on('disconnect', () => {
        console.log("Usuario desconectado");
        coloresDisponibles.push(req.session.color); // Devolver color al pool
    });
});

// Rutas de Express
app.get('/', (req, res) => {
    console.log(`[REQUEST - ${req.method}] ${req.url}`);
    res.send("Bienvenido al servidor de Node.js con WebSockets y Express.");
});

app.post('/login', (req, res) => {
    console.log(`[REQUEST - ${req.method}] ${req.url}`);
    const { username, password } = req.body;

    // Lógica de autenticación (ejemplo)
    if (username === 'usuarioEjemplo' && password === 'contraseña123') {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

app.delete('/login', (req, res) => {
    console.log(`[REQUEST - ${req.method}] ${req.url}`);
    res.send(null);
});

app.get('/mostrarUsuarios', async (req, res) => {
    console.log(req.query);
    const respuesta = await MySQL.realizarQuery(`SELECT * FROM Contactos;`);
    console.log(respuesta);
    res.send(respuesta);
});

app.post('/insertarUsuarios', async (req, res) => {
    console.log(req.body);
    const usuarios = await MySQL.realizarQuery("SELECT idChat FROM Usuarios");
    var existeUsuario = usuarios.some(user => user.idChat === req.body.idChat);

    if (existeUsuario) {
        res.send("Ya existía este usuario");
    } else {
        const respuesta = await MySQL.realizarQuery(`
            INSERT INTO Usuarios (Nombre_Usuario, Contraseña_Usuario)
            VALUES('${req.body.idChat}', '${req.body.username}')
        `);
        console.log({ respuesta });
        res.send("Usuario insertado correctamente");
    }
});
