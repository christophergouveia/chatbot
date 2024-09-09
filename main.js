import "./style.css";

document.querySelector("#app").innerHTML = `
  <div class="chat-container">
    <form class="message-form" action="#">
      <div id="resposta"></div>
      <textarea></textarea>
      <button type="submit">Enviar</button>
    </form>
  </div>
`;
