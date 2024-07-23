const textInput = document.querySelector(".new-todo");
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
function areAllTodosCompleted() {
  return todos.every((todo) => todo.completed);
}
// Event handlers
const onElementsDisplayed = (statement, element) => {
  return statement
    ? (element.style.display = "block")
    : (element.style.display = "none");
};
const loadDb = () => {
  const transaction = db.transaction(["todo_os"], "readwrite");
  return transaction.objectStore("todo_os");
};
const onFilterSelected = (filter) => {
  selectedFilter = filter;
  render();
};
const onTodosLoadedFromDb = (loadedTodos) => {
  todos = loadedTodos;
  render();
};
const onTodoRemoved = (id) => {
  const objectStore = loadDb();
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
  const objectStore = loadDb();
  objectStore.put(todo);
  render();
};
const onCompletedToggled = (id) => {
  const todo = todos.find((todo) => todo.id === id);
  todo.completed = !todo.completed;
  const objectStore = loadDb();
  objectStore.put(todo);
  render();
};
const onPressedToggleAll = () => {
  if (!todos.length) {
    return;
  }
  const areAllCompleted = areAllTodosCompleted();
  todos = todos.map((todo) => ({ ...todo, completed: !areAllCompleted }));
  const objectStore = loadDb();
  todos.forEach((todo) => objectStore.put(todo));
  render();
};
const onPressedClearCompletedButton = () => {
  const objectStore = loadDb();
  todos.forEach((todo) => {
    if (todo.completed) {
      objectStore.delete(todo.id);
    }
  });
  todos = todos.filter((todo) => !todo.completed);
  render();
};

const onListUpdated = (text) => {
  const objectStore = loadDb();
  const request = objectStore.getAll();
  request.onsuccess = () => {
    const idNumber = request.result[request.result.length - 1].id;
    todos.push({
      title: text,
      completed: false,
      isBeingEdited: false,
      id: idNumber,
    });
  };
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
});
let isDbOpened = false;
let isWindowLoaded = false;
function loadInitialTodosFromDb() {
  const objectStore = loadDb();
  const request = objectStore.getAll();
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
  toggleAllCheckboxButton.checked = areAllTodosCompleted();
  const li = document.querySelectorAll(".todo-list li");
  li.forEach((item) => {
    item.remove();
  });
  const todos = getFilteredTodos();
  const isClearCompletedVisible = () => todos.some((todo) => todo.completed);
  onElementsDisplayed(isClearCompletedVisible(), clearCompletedButton);
  const main = document.querySelector(".main");
  const footer = document.querySelector(".footer");
  const isMainDisplayed = () => todos.length > 0;
  onElementsDisplayed(isMainDisplayed(), main);
  onElementsDisplayed(isMainDisplayed(), footer);
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
    todo.completed
      ? (listItem.className = "completed")
      : (listItem.className = "");
    const label = document.createElement("label");
    label.textContent = todo.title;
    div.appendChild(toggleButton);
    div.appendChild(label);
    div.appendChild(deleteButton);
    listItem.appendChild(div);
    const taskList = document.querySelector(".todo-list");
    taskList.append(listItem);
    const count = document.querySelector(".todo-count");
    todos.length === 1
      ? (count.textContent = getTodosCount() + " item left")
      : (count.textContent = getTodosCount() + " items left");
    if (todo.isBeingEdited) {
      listItem.className = "editing";
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
textInput.addEventListener("keypress", () => {
  if (event.key === "Enter") {
    const text = textInput.value;
    text.trim();
    const newItem = { title: text, completed: false };
    const objectStore = loadDb();
    objectStore.add(newItem);
    textInput.value = "";
    textInput.focus();
    onListUpdated(text);
    console.log(todos);
    render();
  }
});
