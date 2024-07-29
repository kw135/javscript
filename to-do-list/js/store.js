import { createStore } from "redux";

const initialState = {
  todos: [],
  filter: "all",
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case "onTodoRemoved":
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };

    case "onEditionInitiated":
    const todo1 = {...state, todos: state.todos.find((todo) => todo.id === id)}
    return todo1.isBeingEdited = true;

    case "onEditionCompleted":
      const editedTodo = state.find((todo) => todo.id === id);
      return (editedTodo.title = newTitle), (editedTodo.isBeingEdited = false);

    case "onCompletedToggled":
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };

    case "onPressedToggleAll":
      const areAllCompleted = state.todos.every((todo) => todo.completed);
      return {
        ...state,
        todos: state.todos.map((todo) => ({
          ...todo,
          completed: !areAllCompleted,
        })),
      };

    case "onPressedClearCompletedButton":
      return { ...state, todos: state.todos.filter((todo) => !todo.completed) };

    case "onFilterSelected":
      return { ...state, filter: action.payload };

    case "onListUpdated":
      return;

    default:
      return state;
  }
};

function removeTodo(todoId) {
  return { type: "onTodoRemoved", payload: todoId };
}
function initiateEdition(todoId) {
  return { type: "onEditionInitiated", payload: todoId };
}
function completeEtition(todoId, newTitle) {
  return { type: "onEditionCompleted", payload: { todoId, newTitle } };
}
function pressToggle(todoId) {
  return { type: "onCompletedToggled", payload: todoId };
}
function pressToggleAll() {
  return { type: "onPressedToggleAll" };
}
function pressClearCompleted() {
  return { type: "onPressedClearCompletedButton" };
}
function selectFilter(filter) {
  return { type: "onFilterSelected", payload: filter };
}

export const store = createStore(reducer);

store.dispatch(removeTodo(1));
store.dispatch(initiateEdition(1));
// store.dispatch(completeEtition(1, "hi"));
store.dispatch(pressToggle(1));
store.dispatch(pressToggleAll());
store.dispatch(pressClearCompleted());
store.dispatch(selectFilter("active"));

