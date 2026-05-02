const properties = [
  {
    title: "2-комнатная квартира у парка",
    type: "Квартира",
    area: "58 м² · Центральный район",
    price: "12 400 000 ₽",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Коттедж с террасой",
    type: "Дом",
    area: "180 м² · Лесная улица",
    price: "29 900 000 ₽",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Таунхаус в закрытом поселке",
    type: "Таунхаус",
    area: "124 м² · Южный квартал",
    price: "18 700 000 ₽",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
  },
];

const cards = document.getElementById("cards");
const template = document.getElementById("cardTemplate");
const typeFilter = document.getElementById("typeFilter");
const leadForm = document.getElementById("leadForm");
const formMessage = document.getElementById("formMessage");

function renderList(type = "all") {
  cards.innerHTML = "";
  const filtered = type === "all" ? properties : properties.filter((item) => item.type === type);

  filtered.forEach((item) => {
    const node = template.content.cloneNode(true);
    node.querySelector("img").src = item.image;
    node.querySelector("h3").textContent = item.title;
    node.querySelector(".meta").textContent = `${item.type} · ${item.area}`;
    node.querySelector(".price").textContent = item.price;
    node.querySelector(".secondary").addEventListener("click", () => {
      formMessage.textContent = `Заявка на «${item.title}» принята. Менеджер свяжется с вами.`;
    });
    cards.appendChild(node);
  });
}

typeFilter.addEventListener("change", () => renderList(typeFilter.value));

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(leadForm);
  const name = data.get("name").toString().trim();
  formMessage.textContent = `Спасибо, ${name}! Мы скоро перезвоним.`;
  leadForm.reset();
});

renderList();
