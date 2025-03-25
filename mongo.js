require("dotenv").config();
const mongoose = require("mongoose");

// Obtiene la contraseña desde .env
const password = process.env.MONGO_PASSWORD;

if (!password) {
  console.error("⚠ Falta la contraseña en las variables de entorno.");
  process.exit(1);
}

const url = `mongodb+srv://nexxuz2017:${password}@cluster0.zgjgs.mongodb.net/notasDB?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);

console.log("⏳ Conectando a MongoDB...");
mongoose
  .connect(url)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  });

// Definir esquema y modelo
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model("Note", noteSchema);

// Crear y guardar una nota
const note = new Note({
  content: "HTML is easy",
  important: true,
});

note
  .save()
  .then((result) => {
    console.log("📝 Nota guardada:", result);
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ Error al guardar la nota:", err));
