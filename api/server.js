const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
const { messageSchema } = require("./schemas/messagesSchema.js");
const config = require("./config.json");
const uri = config.mongodb_server;

mongoose.connect(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const Messages = mongoose.model("Messages", messageSchema);
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Conectado com sucesso ao MongoDB!");
  } finally {
    await client.close();
  }
}

async function verifyDatabases() {
  try {
    await client.close();
    console.log("Tabela de mensagens criada com sucesso!");
  } catch (err) {
    console.error("Error verifying databases:", err);
  }
}

app.post("/api/newMessage", (req, res) => {
  const { message, isGPT } = req.body;
  //check if isGPT doesnt exists, not if aren t true or false
  if(!message || typeof isGPT !== "boolean") {
    return res.status(400).json({ message: "Por favor, preencha todos os campos!" });
  }
  const newMessage = new Messages({
    message: message,
    isGPT: isGPT
  });
  newMessage
    .save()
    .then((msg) => {
      res.status(201).json({ message: "Mensagem salva com sucesso!" });
    })
    .catch((err) => {
      res.status(500).json({ message: "Erro ao salvar a mensagem!" });
    });
});

app.listen(3000, () => {
  console.log("Servidor iniciado na porta 3000");
});

run();
verifyDatabases();