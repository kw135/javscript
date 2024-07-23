const textInput = document.querySelector(".new-todo");
const taskList = document.querySelector(".todo-list");
const main = document.querySelector(".main");
const footer = document.querySelector(".footer");
const count = document.querySelector(".todo-count");
const toggleAllCheckboxButton = document.querySelector(".toggle-all");
const clearCompletedButton = document.querySelector(".clear-completed");
let todos = [];
let selectedFilter = "all";

// Selectors
const getTodosCount = () => getFilteredTodos().length;
function getFilteredTodos() {
  if (selectedFilter === "all") {
    return todos;
  }
  return todos.filter(
    (todo) => todo.completed === (selectedFilter === "completed")
  );
}

// Event handlers
const onFilterSelected = (filter) => {
  selectedFilter = filter;
  render();
};

const onTodosLoadedFromDb = (loadedTodos) => {
  todos = loadedTodos;
  render();
};

const onTodoRemoved = (id) => {
  const transaction = db.transaction(["todo_os"], "readwrite");
  const objectStore = transaction.objectStore("todo_os");
  objectStore.delete(id);
  todos = todos.filter((todo) => todo.id !== id);
  render();
};

const onEditionInitiated = (id) => {
  const todo = todos.find((todo) => todo.id === id);
  todo.isBeingEdited = true;
  render();
};

const onEditionCompleted = (id, newTitle) => {
  const todo = todos.find((todo) => todo.id === id);
  todo.title = newTitle;
  todo.isBeingEdited = false;
  const transaction = db.transaction(["todo_os"], "readwrite");
  const objectStore = transaction.objectStore("todo_os");
  objectStore.put(todo);
  render();
};

const onCompletedToggled = (id) => {
  const todo = todos.find((todo) => todo.id === id);
  todo.completed = !todo.completed;
  const transaction = db.transaction(["todo_os"], "readwrite");
  const objectStore = transaction.objectStore("todo_os");
  objectStore.put(todo);
  render();
};

const onPressedToggleAll = () => {
  todos = todos.map((todo) => ({
    ...todo,
    completed: toggleAllCheckboxButton.checked,
  }));
  const transaction = db.transaction(["todo_os"], "readwrite");
  const objectStore = transaction.objectStore("todo_os");
  todos.forEach((todo) => objectStore.put(todo));
  render();
};

const onPressedClearCompletedButton = () => {
  const transaction = db.transaction(["todo_os"], "readwrite");
  const objectStore = transaction.objectStore("todo_os");
  todos.forEach((todo) =>
    todo.completed ? objectStore.delete(todo.id) : null
  );
  todos = todos.filter((todo) => !todo.completed);
  render();
};

//otwarcie bazy danych
let db;
const openRequest = window.indexedDB.open("todo_db", 1);
openRequest.addEventListener("error", () =>
  console.error("Database failed to open")
);
openRequest.addEventListener("upgradeneeded", (e) => {
  db = e.target.result;
  const objectStore = db.createObjectStore("todo_os", {
    keyPath: "id",
    autoIncrement: true,
  });
  objectStore.createIndex("title", "title", { unique: false });
  objectStore.createIndex("body", "body", { unique: false });
  console.log("Database setup complete");
});
let isDbOpened = false;
let isWindowLoaded = false;

function loadInitialTodosFromDb() {
  const request = db
    .transaction("todo_os", "readonly")
    .objectStore("todo_os")
    .getAll();
  request.onsuccess = () => {
    onTodosLoadedFromDb(request.result);
  };
}

openRequest.addEventListener("success", () => {
  isDbOpened = true;
  db = openRequest.result;
  if (isWindowLoaded) {
    loadInitialTodosFromDb();
  }
});

window.addEventListener("load", () => {
  isWindowLoaded = true;
  if (isDbOpened) {
    loadInitialTodosFromDb();
  }
});

const routes = {
  "/": () => onFilterSelected("all"),
  "/active": () => onFilterSelected("active"),
  "/completed": () => onFilterSelected("completed"),
};
const router = Router(routes);
router.init();

clearCompletedButton.addEventListener("click", () =>
  onPressedClearCompletedButton()
);
toggleAllCheckboxButton.addEventListener("change", () => onPressedToggleAll());
function render() {
  clearCompletedButton.style.display = "none";
  const li = document.querySelectorAll(".todo-list li");
  li.forEach((item) => {
    item.remove();
  });
  const todos = getFilteredTodos();
  const isClearCompletedVisible = () => todos.some((todo) => todo.completed);
  isClearCompletedVisible()
    ? (clearCompletedButton.style.display = "block")
    : (clearCompletedButton.style.display = "none");
  const isMainDisplayed = () => todos.length > 0;
  isMainDisplayed()
    ? (main.style.display = "block")
    : (main.style.display = "none");
  isMainDisplayed()
    ? (footer.style.display = "block")
    : (footer.style.display = "none");
  todos.forEach((todo) => {
    const div = document.createElement("div");
    div.className = "view";
    const toggleButton = document.createElement("input");
    toggleButton.type = "checkbox";
    toggleButton.className = "toggle";
    toggleButton.checked = todo.completed;
    const deleteButton = document.createElement("button");
    deleteButton.className = "destroy";
    const filters = document.querySelectorAll(".filters a");
    filters.forEach((a) => {
      a.classList.remove("selected");
    });
    const filter = document.getElementById("filter-" + selectedFilter);
    filter.className = "filter selected";
    const listItem = document.createElement("li");
    listItem.setAttribute("meta-id", todo.id);
    todo.completed
      ? (listItem.className = "completed")
      : (listItem.className = "");
    const label = document.createElement("label");
    label.textContent = todo.title;
    div.appendChild(toggleButton);
    div.appendChild(label);
    div.appendChild(deleteButton);
    listItem.appendChild(div);
    taskList.append(listItem);
    count.textContent = getTodosCount() + " items left";
    if (todo.isBeingEdited) {
      listItem.classList = "editing";
      const newText = document.createElement("input");
      newText.className = "edit";
      newText.type = "text";
      listItem.appendChild(newText);
      newText.focus();
      newText.addEventListener("change", () => {
        label.textContent = newText.value;
        onEditionCompleted(todo.id, newText.value);
        listItem.removeChild(newText);
        listItem.className = "";
      });
    }

    deleteButton.addEventListener("click", () => onTodoRemoved(todo.id));
    toggleButton.addEventListener("click", () => onCompletedToggled(todo.id));
    label.addEventListener("dblclick", () => onEditionInitiated(todo.id));
  });
}
textInput.addEventListener("change", () => {
  const text = textInput.value;
  text.trim();
  const newItem = { title: text, completed: false, isBeingEdited: false };
  let transaction = db.transaction(["todo_os"], "readwrite");
  const objectStore = transaction.objectStore("todo_os");
  objectStore.add(newItem);
  transaction.addEventListener("complete", () => {
    console.log("Transaction completed: database modification finished.");
  });
  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
  textInput.value = "";
  textInput.focus();

  const request = objectStore.getAll();
  request.onsuccess = () => {
    const idNumber = request.result[request.result.length - 1].id;
    todos.push({
      title: text,
      completed: false,
      isBeingEdited: false,
      id: idNumber,
    });
    render();
  };
});
