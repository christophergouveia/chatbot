import { GoogleGenerativeAI } from "@google/generative-ai";
import { marked } from "marked";

const form = document.querySelector(".message-form");
const messages = document.querySelector("#resposta");
const textarea = document.querySelector("textarea");

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const chat = model.startChat();

function sendMessage(message, isGPT) {
  fetch("http://localhost:3000/api/newMessage", {
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
    .then((data) => {
    })
    .catch((error) => {
      console.error("Erro:", error);
    });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = textarea.value.trim();
  if (message === "") return;

  const messageUsuario = document.createElement("div");
  messageUsuario.classList.add("message-usuario");
  messageUsuario.innerHTML = `<span>${message}</span>`;
  messages.appendChild(messageUsuario);

  textarea.value = "";

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
});
