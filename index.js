require("dotenv").config();
const Note = require("./models/notes");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Habilitar CORS para evitar problemas de acceso entre frontend y backend
app.use(cors());
app.use(express.json());

// Datos de prueba
let notes = [
  { id: 1, content: "HTML is easy", important: true },
  { id: 2, content: "Browser can execute only JavaScript", important: false },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true,
  },
];

// Servir el frontend desde la carpeta "dist"
app.use(express.static("dist"));

// Endpoint para verificar que el servidor está funcionando
app.get("/", (req, res) => {
  res.send("<h1>¡Servidor en ejecución!</h1>");
});

// Obtener todas las notas
app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

// Obtener una nota específica por ID
// app.get("/api/notes/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const note = notes.find((note) => note.id === id);

//   if (note) {
//     res.json(note);
//   } else {
//     res.status(404).json({ error: "Nota no encontrada" });
//   }
// });

app.get("/api/notes/:id", (request, response) => {
  Note.findById(request.params.id).then((note) => {
    response.json(note);
  });
});

// Generar un nuevo ID único
const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

// Crear una nueva nota
app.post("/api/notes", (request, response) => {
  const body = request.body;

  if (body.content === undefined) {
    return response.status(400).json({ error: "content missing" });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

// Eliminar una nota por ID
app.delete("/api/notes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  notes = notes.filter((note) => note.id !== id);

  res.status(204).end();
});

// Servir el frontend en caso de rutas desconocidas
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Definir puerto para Render u otro servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
