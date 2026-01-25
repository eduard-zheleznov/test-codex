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
