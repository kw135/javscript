const textInput = document.querySelector(".new-todo");
const taskList = document.querySelector(".todo-list");
const main = document.querySelector(".main");
const footer = document.querySelector(".footer");
const count = document.querySelector(".todo-count");
const toggleAllCheckboxButton = document.querySelector(".toggle-all");
const clearCompletedButton = document.querySelector(".clear-completed");
clearCompletedButton.style.display = "none";
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

openRequest.addEventListener("success", () => {
  isDbOpened = true;
  db = openRequest.result;
  if (isWindowLoaded) {
    loadPreviousTasks();
  }
});

window.addEventListener("load", () => {
  isWindowLoaded = true;
  if (isDbOpened) {
    loadPreviousTasks();
  }
});

displayElements();
function monitorListChanges() {
  //wywoluje sie kiedy zmieni sie liczba li
  const observer = new MutationObserver((mutationsList) => {
    let liCountChanged = false;
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        liCountChanged = true;
        break;
      }
    }
    if (liCountChanged) {
      checkAmount();
      displayElements();
    }
  });
  const config = { childList: true, subtree: false };
  observer.observe(taskList, config);
}
monitorListChanges();

function monitorListClassChanges() {
  //wywoluje sie gdy zmieni sie klasa li
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      const list = mutation.target.parentNode;
      const isCompleted = (li) => li.className === "completed";
      clearCompletedButton.style.display = Array.from(list.childNodes).some(
        isCompleted
      )
        ? "block"
        : "none";
    }
  });
  observer.observe(taskList, {
    childList: true,
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  });
}
monitorListClassChanges();

function checkAmount() {
  let todosCount = document.querySelectorAll("li").length - 3;
  if (todosCount > 1) {
    return (count.textContent = todosCount + " items left");
  } else {
    return (count.textContent = todosCount + " item left");
  }
}
function displayElements() {
  let size = document.querySelectorAll("li").length - 3;
  if (size < 1) {
    main.style.display = "none";
    footer.style.display = "none";
  } else {
    main.style.display = "block";
    footer.style.display = "block";
  }
}
const routes = {
  "/": showAll,
  "/active": showActive,
  "/completed": showCompleted,
};
const router = Router(routes);
router.init();

function showAll() {
  filterTodos("all");
  setFilter("all");
}

function showActive() {
  filterTodos("active");
  setFilter("active");
}

function showCompleted() {
  filterTodos("completed");
  setFilter("completed");
}

function filterTodos(filter) {
  var todos = document.querySelectorAll(".todo-list li");
  todos.forEach(function (todo) {
    var isCompleted = todo.classList.contains("completed");
    if (filter === "all") {
      todo.style.display = "block";
    } else if (filter === "active") {
      todo.style.display = isCompleted ? "none" : "block";
    } else if (filter === "completed") {
      todo.style.display = isCompleted ? "block" : "none";
    }
  });
}

function setFilter(filter) {
  var filters = document.querySelectorAll(".filter");
  filters.forEach(function (link) {
    if (link.dataset.filter === filter) {
      link.classList.add("selected");
    } else {
      link.classList.remove("selected");
    }
  });
  localStorage.setItem("activeFilter", filter);
}

window.addEventListener("load", function () {
  var activeFilter = localStorage.getItem("activeFilter") || "all";
  router.setRoute(activeFilter === "all" ? "/" : "/" + activeFilter);
  setFilter(activeFilter);
});

document.querySelector("#filter-all").dataset.filter = "all";
document.querySelector("#filter-active").dataset.filter = "active";
document.querySelector("#filter-completed").dataset.filter = "completed";

function addRemoveTaskListener(deleteButton, listItem) {
  deleteButton.addEventListener("click", removeTask);
  function removeTask() {
    listItem.remove();
    const noteId = Number(listItem.getAttribute("meta-id"));
    transaction = db.transaction(["todo_os"], "readwrite");
    const objectStore = transaction.objectStore("todo_os");
    objectStore.delete(noteId);
  }
}
function addMarkTaskListener(toggleButton, listItem) {
  toggleButton.addEventListener("click", markTask);
  function markTask() {
    const key = Number(listItem.getAttribute("meta-id"));
    if (!toggleButton.checked) {
      listItem.className = "";
      updateStatus(key, false, "boolean");
    } else {
      listItem.className = "completed";
      updateStatus(key, true, "boolean");
    }
  }
}
function addEditLabelListener(label, listItem) {
  label.addEventListener("click", editLabel);
  function editLabel() {
    const key = Number(listItem.getAttribute("meta-id"));
    listItem.className = "editing";
    const newText = document.createElement("input");
    newText.className = "edit";
    newText.type = "text";
    listItem.appendChild(newText);
    newText.focus();
    newText.addEventListener("change", () => {
      label.textContent = newText.value;
      updateStatus(key, label.textContent, "string");
      listItem.removeChild(newText);
      listItem.className = "";
    });
  }
}
function addToggleAllCheckboxListener(
  toggleAllCheckboxButton,
  listItem,
  toggleButton
) {
  let clickCounter = 0;
  toggleAllCheckboxButton.addEventListener("change", toggleAllCheckbox);
  function toggleAllCheckbox() {
    if (clickCounter === 0) {
      toggleButton.checked = true;
      listItem.className = "completed";
      clickCounter++;
    } else if (clickCounter === 1) {
      toggleButton.checked = false;
      listItem.className = "";
      clickCounter--;
    }
  }
}
function addClearCompletedButtonListener(
  clearCompletedButton,
  listItem,
  toggleButton
) {
  clearCompletedButton.addEventListener("click", clearCompleted);
  function clearCompleted() {
    if (toggleButton.checked) {
      listItem.remove();
      const noteId = Number(listItem.getAttribute("meta-id"));
      transaction = db.transaction(["todo_os"], "readwrite");
      const objectStore = transaction.objectStore("todo_os");
      objectStore.delete(noteId);
    }
  }
}

function loadPreviousTasks() {
  const request = db
    .transaction("todo_os", "readonly")
    .objectStore("todo_os")
    .getAll();
  request.onsuccess = (e) => {
    const todos = e.target.result;
    todos.forEach((todo) => {
      const div = document.createElement("div");
      div.className = "view";
      const toggleButton = document.createElement("input");
      toggleButton.type = "checkbox";
      toggleButton.className = "toggle";
      toggleButton.checked = todo.completed;
      const deleteButton = document.createElement("button");
      deleteButton.className = "destroy";
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

      deleteButton.addEventListener(
        "click",
        addRemoveTaskListener(deleteButton, listItem)
      );
      toggleButton.addEventListener(
        "click",
        addMarkTaskListener(toggleButton, listItem)
      );
      label.addEventListener("dblclick", addEditLabelListener(label, listItem));
      toggleAllCheckboxButton.addEventListener(
        "change",
        addToggleAllCheckboxListener(
          toggleAllCheckboxButton,
          listItem,
          toggleButton
        )
      );

      clearCompletedButton.addEventListener(
        "click",
        addClearCompletedButtonListener(
          clearCompletedButton,
          listItem,
          toggleButton
        )
      );
    });
    request.onerror = (e) => {
      console.error("Error getting todos from database", e);
    };
  };
}

//add a task to the list
textInput.addEventListener("change", () => {
  const text = textInput.value;
  text.trim();
  const div = document.createElement("div");
  div.className = "view";
  const toggleButton = document.createElement("input");
  toggleButton.type = "checkbox";
  toggleButton.className = "toggle";
  const deleteButton = document.createElement("button");
  deleteButton.className = "destroy";
  const listItem = document.createElement("li");
  const label = document.createElement("label");
  label.textContent = text;
  div.appendChild(toggleButton);
  div.appendChild(label);
  div.appendChild(deleteButton);
  listItem.appendChild(div);
  taskList.append(listItem);

  const newItem = { title: textInput.value, completed: false };
  let transaction = db.transaction(["todo_os"], "readwrite");
  const objectStore = transaction.objectStore("todo_os");
  const query = objectStore.add(newItem);
  query.onsuccess = (e) => {
    listItem.setAttribute("meta-id", e.target.result);
  };
  transaction.addEventListener("complete", (e) => {
    console.log("Transaction completed: database modification finished.");
  });

  transaction.addEventListener("error", () =>
    console.log("Transaction not opened due to error")
  );
  textInput.value = "";
  textInput.focus();

  deleteButton.addEventListener(
    "click",
    addRemoveTaskListener(deleteButton, listItem)
  );
  toggleButton.addEventListener(
    "click",
    addMarkTaskListener(toggleButton, listItem)
  );
  label.addEventListener("dblclick", addEditLabelListener(label, listItem));
  toggleAllCheckboxButton.addEventListener(
    "change",
    addToggleAllCheckboxListener(
      toggleAllCheckboxButton,
      listItem,
      toggleButton
    )
  );
  clearCompletedButton.addEventListener(
    "click",
    addClearCompletedButtonListener(
      clearCompletedButton,
      listItem,
      toggleButton
    )
  );
});

function updateStatus(key, value, type) {
  const objectStore = db
    .transaction("todo_os", "readwrite")
    .objectStore("todo_os");
  const request = objectStore.get(key);
  request.onsuccess = () => {
    let check = request.result;
    if (type === "boolean") {
      check.completed = value;
    } else if (type === "string") {
      check.title = value;
    }
    objectStore.put(check);
  };
}
