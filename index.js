require("dotenv").config();
const Note = require("./models/notes");
const User = require("./models/user");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = require("./app"); // la aplicación Express real
const config = require("./utils/config");
const logger = require("./utils/logger");

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});
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

app.get("/api/users", (req, res) => {
  User.find({}).then((users) => {
    res.json(users);
  });
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

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })

    .catch((error) => next(error));
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

  note
    .save()
    .then((savedNote) => {
      response.json(savedNote);
    })
    .catch((error) => next(error));
});

// Eliminar una nota por ID
app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// cambiar importancia de la nota
app.put("/api/notes/:id", (request, response, next) => {
  const { content, important } = request.body;

  Note.findByIdAndUpdate(
    request.params.id,

    { content, important },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

// Servir el frontend en caso de rutas desconocidas
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// controlador de errores
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "validationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler);
