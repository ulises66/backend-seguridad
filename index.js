const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const knex = require("knex");

// ============================
// Configuración desde variables de entorno (inyectadas por ECS)
// ============================
const {
    DB_HOST,
    DB_PORT = 3306,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    NODE_ENV,
} = process.env;

const SECRET_KEY = process.env.SECRET_KEY || "mi_clave_secreta";

// ============================
// Conexión a base de datos (Knex + MySQL)
// ============================
const db = knex({
    client: "mysql2",
    connection: {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USERNAME,
        password: DB_PASSWORD,
        database: DB_NAME,
    },
    pool: { min: 0, max: 10 },
});

// ============================
// Servidor Express
// ============================
const app = express();
app.use(cors());
app.use(express.json());

// ============================
// Ruta raíz
// ============================
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        env: NODE_ENV || "dev",
        message: "Backend API funcionando correctamente",
    });
});

// ============================
// Ruta de login (genera token JWT)
// ============================
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "1234") {
        const user = { id: 1, username: "admin", role: "admin" };
        const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });
        return res.json({ token });
    }

    res.status(401).json({ message: "Credenciales inválidas" });
});

// ============================
// Middleware para verificar JWT
// ============================
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ============================
// Rutas de prueba / perfil
// ============================
app.get("/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Acceso autorizado",
        user: req.user,
    });
});

// ============================
// ENDPOINTS: /api/v1/users
// ============================

// Obtener usuario por ID
app.get("/api/v1/users/:id", async (req, res) => {
    try {
        const user = await db("users").where({ id: req.params.id }).first();
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (err) {
        console.error("Error al obtener usuario:", err);
        res.status(500).json({ message: "Error en el servidor" });
    }
});

// Crear nuevo usuario
app.post("/api/v1/users", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Faltan campos requeridos" });
        }

        const [id] = await db("users").insert({ name, email, password });
        const newUser = await db("users").where({ id }).first();

        res.status(201).json(newUser);
    } catch (err) {
        console.error("Error al crear usuario:", err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "El email ya existe" });
        }
        res.status(500).json({ message: "Error en el servidor" });
    }
});

// ============================
// Inicia el servidor
// ============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
