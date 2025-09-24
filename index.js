const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Clave secreta (en producción usar variables de entorno)
const SECRET_KEY = "mi_clave_secreta";

// Ruta de login que genera un token
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validación simple (ejemplo)
    if (username === "admin" && password === "1234") {
        const user = { id: 1, username: "admin", role: "admin" };

        // Generar token con expiración de 1h
        const token = jwt.sign(user, SECRET_KEY, { expiresIn: "1h" });

        return res.json({ token });
    }

    res.status(401).json({ message: "Credenciales inválidas" });
});

// Middleware para verificar el token
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // "Bearer TOKEN"

    if (!token) return res.sendStatus(401); // No hay token

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Token inválido o expirado
        req.user = user; // Guardamos la info del usuario
        next();
    });
}

// Ruta protegida
app.get("/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Acceso autorizado",
        user: req.user,
    });
});

app.listen(4000, () => {
    console.log("Servidor corriendo en http://localhost:4000");
});
