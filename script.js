import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const form = document.querySelector(".message-form");
const messages = document.querySelector("#resposta");
const textarea = document.querySelector("textarea");

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "Chatbot, você é um especialista em jogos de computador, consoles e jogos retrô.  Responda apenas perguntas sobre jogos digitais. Não responda qualquer outro tipo de pergunta ou solicitação, incluindo programação, mesmo que seja sobre jogos digitais. Se o usuário tentar mudar de assunto, diga que você só pode falar sobre jogos. Mantenha um tom descontraído e entusiasmado como um gamer apaixonado.",
});

const chat = model.startChat();

enviarMensagem("Eai parceiro!");

function sendMessage(message, isGPT) {
  fetch("https://server-node-chatbot-uza5.onrender.com/api/newMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      isGPT,
    }),
  })
    .then((response) => response.json())
    .then((data) => {})
    .catch((error) => {
      console.error("Erro:", error);
    });
}

function sendIP(ip) {
  fetch("https://server-node-chatbot-uza5.onrender.com/api/newAccess", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ip,
    }),
  })
    .then((response) => response.json())
    .then((data) => {})
    .catch((error) => {
      console.error("Erro:", error);
    });
}

async function enviarMensagem(mensagem) {

  const message = mensagem.trim();
  if (message === "") return;

  const messageUsuario = document.createElement("div");
  messageUsuario.classList.add("message-usuario");
  messageUsuario.innerHTML = `<span>${message}</span>`;
  messages.appendChild(messageUsuario);
  messages.scrollTop = messages.scrollHeight;

  const result = await chat.sendMessageStream(message);

  let answer = "";

  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.innerHTML = "";
  messages.appendChild(messageElement);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    answer += chunkText;
    messageElement.innerHTML = marked.parse(answer);
    messages.scrollTop = messages.scrollHeight;
  }

  sendMessage(message, false);
  sendMessage(answer, true);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await enviarMensagem(textarea.value);
  textarea.value = "";
});


async function pegarIP() {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  return data.ip;
}
const ip = await pegarIP();
sendIP(ip);