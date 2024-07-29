import {
  createStore,
  applyMiddleware,
} from "https://unpkg.com/redux@5.0.1/dist/redux.browser.mjs";

const textInput = document.querySelector(".new-todo");
const toggleAllCheckboxButton = document.querySelector(".toggle-all");
const clearCompletedButton = document.querySelector(".clear-completed");

// Selectors
const getTodosCount = () => getFilteredTodos().length;
function getFilteredTodos() {
  if (store.getState().selectedFilter === "all") {
    return store.getState().todos;
  }
  return store.getState().todos.filter(
    (todo) => todo.completed === (store.getState().selectedFilter === "completed")
  );
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

const todosLoaded = (loadedTodos) => ({ type: "todosLoaded", payload: loadedTodos });
const onTodosLoadedFromDb = (loadedTodos) => {
  store.dispatch(todosLoaded(loadedTodos));
  render();
};

function areAllTodosCompleted() {
  return store.getState().todos.every((todo) => todo.completed);
}
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
const initialState = {
  todos: [],
  selectedFilter: "all",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "todosLoaded":
      return {...state, todos: action.payload };

    case "onTodoRemoved":
      return {
        ...state,
        todos: state.todos.filter((todo) => 
          todo.id !== action.payload
        ),
      };

    case "onEditionInitiated":
      return { 
        ...state,
        todos: state.todos.map((todo) =>
            todo.id === action.payload 
              ? { ...todo, isBeingEdited: true } 
              : todo
          )
      };

    case "onEditionCompleted":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id 
        ? { ...todo, title: action.payload.newTitle, isBeingEdited: false } 
        : todo
        ),
      };

    case "onCompletedToggle":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload 
           ? {...todo, completed:!todo.completed } 
            : todo
        ),
      }

    case "onPressedToggleAll":
      const areAllCompleted = state.todos.every(todo => todo.completed);
      return {
        ...state,
        todos: state.todos.map(todo => ({ ...todo, completed: !areAllCompleted })),
      };

    case "onPressedClearCompletedButton":
      return {
        ...state,
        todos: state.todos.filter(todo =>!todo.completed),
      }

    case "onFilterSelected":
      return {...state, selectedFilter: action.payload};

    default:
      return state;
  }
};

const getTodoById = (id) => {
  return store.getState().todos.find((todo) => todo.id === id);
}

function removeTodo(todoId) {
  store.dispatch({type: "onTodoRemoved", payload: todoId});
  const objectStore = loadDb();
  objectStore.delete(todoId);
}
function initiateEdition(todoId) {
  store.dispatch({ type: "onEditionInitated", payload: todoId })
  const objectStore = loadDb();
  objectStore.put(getTodoById(todoId));
}
function completeEtition(todoId, newTitle) {
  store.dispatch({ type: "onEditionCompleted", payload: { todoId, newTitle } });
  const objectStore = loadDb();
  objectStore.put(getTodoById(todoId));
}
function pressToggle(todoId) {
  console.log("toggle", todoId);
  console.log("before", getTodoById(todoId))
  store.dispatch({type: "onCompletedToggle", payload: todoId  });
  const objectStore = loadDb();
  objectStore.put(getTodoById(todoId));
  console.log("after", getTodoById(todoId))
}
function pressToggleAll() {
  store.dispatch({ type: "onPressedToggleAll" });
  const objectStore = loadDb();
  objectStore.put(todo)
}
function pressClearCompleted() {
  store.dispatch({ type: "onPressedClearCompleted" });
  const objectStore = loadDb();
  objectStore.put(store.get);
}
function selectFilter(filter) {
  store.dispatch({ type: "onFilterSelected", payload: filter });
}

const middleware = store => (next) => (action) => {
  next(action);
  return render();
};
const middlewareEnchancer = applyMiddleware(middleware);
const store = createStore(reducer,middlewareEnchancer);

const routes = {
  "/": () => selectFilter("all"),
  "/active": () => selectFilter("active"),
  "/completed": () => selectFilter("completed"),
};
const router = Router(routes);
router.init();

clearCompletedButton.addEventListener("click", () =>
  pressClearCompleted()
);
toggleAllCheckboxButton.addEventListener("click", () =>
  pressToggleAll()
);
function render() {
  const li = document.querySelectorAll(".todo-list li");
  li.forEach((item) => {
    item.remove();
  });
  const todos = getFilteredTodos();
  toggleAllCheckboxButton.checked = areAllTodosCompleted();
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
    const filter = document.getElementById("filter-" + store.getState().selectedFilter);
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
        completeEtition(todo.id, newText.value);
        listItem.removeChild(newText);
        listItem.className = "";
      });
    }
    deleteButton.addEventListener("click", () =>
      removeTodo(todo.id)
    );
    toggleButton.addEventListener("click", () =>
      pressToggle(todo.id)
    );
    label.addEventListener("dblclick", () =>
      initiateEdition(todo.id)
    );
  });
}
textInput.addEventListener("keypress", () => {
  if (event.key === "Enter") {
    if (textInput.value !== "") {
      const text = textInput.value;
      text.trim();
      const newItem = { title: text, completed: false };
      const objectStore = loadDb();
      objectStore.add(newItem);
      textInput.value = "";
      textInput.focus();
      render();
    }
  }
});
