const cards = document.querySelectorAll("[data-testid='prototype-card']");
const message = document.querySelector("[data-testid='prototype-message']");

for (const card of cards) {
  card.addEventListener("click", () => {
    card.classList.add("is-played");
    const cardName = card.getAttribute("data-card-name") ?? "招式";
    if (message) {
      message.textContent = `${cardName}已出。`;
    }
  });
}
