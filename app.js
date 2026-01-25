const inviteLink = document.getElementById("inviteLink");
const copyInvite = document.getElementById("copyInvite");
const refreshInvite = document.getElementById("refreshInvite");
const openInvite = document.getElementById("openInvite");
const openTask = document.getElementById("openTask");

const memberForm = document.getElementById("memberForm");
const memberList = document.getElementById("memberList");
const memberTemplate = document.getElementById("memberItem");
const teamCount = document.getElementById("teamCount");

const taskForm = document.getElementById("taskForm");
const taskBoard = document.getElementById("taskBoard");
const taskTemplate = document.getElementById("taskCard");
const taskCount = document.getElementById("taskCount");
const speedometer = document.getElementById("speedometer");
const speedometerValue = document.getElementById("speedometerValue");
const speedometerHint = document.getElementById("speedometerHint");
const speedometerTicks = document.getElementById("speedometerTicks");
const updateLabel = document.getElementById("updateLabel");

const state = {
  members: [
    { id: crypto.randomUUID(), name: "Анна Смирнова", role: "Продукт" },
    { id: crypto.randomUUID(), name: "Игорь Соколов", role: "Разработка" },
  ],
  tasks: [],
};

const formatDate = (value) => {
  if (!value) return "Без срока";
  const date = new Date(value);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
  }).format(date);
};

const updateInvite = () => {
  const token = crypto.randomUUID().split("-")[0];
  inviteLink.value = `https://tasklink.app/invite/${token}`;
};

const renderMembers = () => {
  memberList.innerHTML = "";
  const select = taskForm.assignee;
  select.innerHTML = "";

  state.members.forEach((member) => {
    const item = memberTemplate.content.cloneNode(true);
    item.querySelector("strong").textContent = member.name;
    item.querySelector("span").textContent = member.role;
    item.querySelector("button").addEventListener("click", () => {
      state.members = state.members.filter((entry) => entry.id !== member.id);
      state.tasks = state.tasks.map((task) =>
        task.assigneeId === member.id
          ? { ...task, assigneeId: null, assigneeName: "Не назначен" }
          : task
      );
      renderMembers();
      renderTasks();
    });
    memberList.appendChild(item);

    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = `${member.name} — ${member.role}`;
    select.appendChild(option);
  });

  if (!state.members.length) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Добавьте участника";
    select.appendChild(placeholder);
  }

  teamCount.textContent = `${state.members.length} участников`;
};

const renderTasks = () => {
  taskBoard.innerHTML = "";
  state.tasks.forEach((task) => {
    const card = taskTemplate.content.cloneNode(true);
    const article = card.querySelector("article");
    const status = task.completed ? "Выполнено" : "В работе";

    card.querySelector("h3").textContent = task.title;
    card.querySelector(".task__meta").textContent = `${task.assigneeName} · ${formatDate(
      task.deadline
    )}`;
    card.querySelector(".task__description").textContent = task.description || "Без описания";
    card.querySelector(".pill").textContent = status;

    if (task.completed) {
      article.classList.add("completed");
    }

    card.querySelector("button.secondary").addEventListener("click", () => {
      task.completed = !task.completed;
      renderTasks();
    });

    card.querySelector("header button").addEventListener("click", () => {
      state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
      renderTasks();
    });

    taskBoard.appendChild(card);
  });

  taskCount.textContent = `${state.tasks.length} задач`;
  updateSpeedometer();
};

const updateSpeedometer = () => {
  if (!speedometer || !speedometerValue) return;
  const activeTasks = state.tasks.filter((task) => !task.completed).length;
  const clamped = Math.min(activeTasks, 10);
  const rotation = -120 + (clamped / 10) * 240;
  speedometer.style.setProperty("--needle-rotation", `${rotation}deg`);
  speedometerValue.textContent = clamped.toLocaleString("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  if (speedometerHint) {
    speedometerHint.textContent = `${clamped} из 10`;
  }
};

const renderSpeedometerTicks = () => {
  if (!speedometerTicks) return;
  speedometerTicks.innerHTML = "";
  const center = { x: 150, y: 150 };
  const outerRadius = 138;
  const innerRadius = 124;

  for (let i = 0; i <= 10; i += 1) {
    const angle = (-120 + (i / 10) * 240) * (Math.PI / 180);
    const x1 = center.x + Math.cos(angle) * innerRadius;
    const y1 = center.y + Math.sin(angle) * innerRadius;
    const x2 = center.x + Math.cos(angle) * outerRadius;
    const y2 = center.y + Math.sin(angle) * outerRadius;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1.toFixed(1));
    line.setAttribute("y1", y1.toFixed(1));
    line.setAttribute("x2", x2.toFixed(1));
    line.setAttribute("y2", y2.toFixed(1));
    line.setAttribute("stroke", "#2b3f86");
    line.setAttribute("stroke-width", "6");
    line.setAttribute("stroke-linecap", "round");
    speedometerTicks.appendChild(line);
  }
};

memberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(memberForm);
  const name = formData.get("name").toString().trim();
  const role = formData.get("role").toString().trim();

  if (!name || !role) return;

  state.members.push({ id: crypto.randomUUID(), name, role });
  memberForm.reset();
  renderMembers();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(taskForm);
  const title = formData.get("title").toString().trim();
  const assigneeId = formData.get("assignee").toString();
  const deadline = formData.get("deadline").toString();
  const description = formData.get("description").toString().trim();

  if (!title || !assigneeId) return;

  const assignee = state.members.find((member) => member.id === assigneeId);

  state.tasks.unshift({
    id: crypto.randomUUID(),
    title,
    assigneeId,
    assigneeName: assignee ? assignee.name : "Не назначен",
    deadline,
    description,
    completed: false,
  });

  taskForm.reset();
  renderTasks();
});

copyInvite.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    copyInvite.textContent = "Скопировано";
    setTimeout(() => {
      copyInvite.textContent = "Скопировать";
    }, 2000);
  } catch (error) {
    copyInvite.textContent = "Не удалось";
    setTimeout(() => {
      copyInvite.textContent = "Скопировать";
    }, 2000);
  }
});

refreshInvite.addEventListener("click", updateInvite);
openInvite.addEventListener("click", () => inviteLink.scrollIntoView({ behavior: "smooth" }));
openTask.addEventListener("click", () => taskForm.scrollIntoView({ behavior: "smooth" }));

updateInvite();
renderMembers();
renderTasks();
renderSpeedometerTicks();

if (updateLabel) {
  const stored = Number(localStorage.getItem("tasklinkUpdate")) || 4;
  const next = stored + 1;
  localStorage.setItem("tasklinkUpdate", String(next));
  updateLabel.textContent = `Обновление ${next}`;
}
