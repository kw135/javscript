const textInput = document.querySelector(".new-todo")
const taskList = document.querySelector(".todo-list")
const toggleButton = document.querySelector(".toggle")
const main = document.querySelector(".main")
const footer = document.querySelector(".footer")
const listItem = document.querySelector("li")
const deleteButton = document.querySelector(".destroy")
const count = document.querySelector(".todo-count")
const toggleAllCheckbox = document.querySelector('.toggle-all');
const clearCompleted = document.querySelector('.clear-completed')
clearCompleted.style.display = "none"

displayElements()
function monitorListChanges() {
    const observer = new MutationObserver((mutationsList) => {
        let liCountChanged = false;
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                liCountChanged = true;
                break;
            }
        }
        if (liCountChanged) {
            checkAmount()
            displayElements()
        }
    });
    const config = { childList: true, subtree: false };
    observer.observe(taskList, config);
}
monitorListChanges();

function checkAmount() {
    let todosCount = document.querySelectorAll("li").length - 3
    if (todosCount > 1){
        return count.textContent = todosCount + " items left"
    }else {
        return count.textContent = todosCount + " item left"
    }
}
function detectChange(){
    const checkk = document.querySelectorAll(".toggle")
    for (let i = 0; i<checkk.length;i++) {
        if (checkk[i].checked) {
            clearCompleted.style.display = "block"
        } else {
            clearCompleted.style.display = "none"
        }
    }
}
function displayElements() {
    let size = document.querySelectorAll("li").length - 3
    if (size < 1) {
        main.style.display = "none"
        footer.style.display = "none"
    } else {
        main.style.display = "block"
        footer.style.display = "block"
    }
}

//opening database
let db
const openRequest = window.indexedDB.open("todo_db", 1);
openRequest.addEventListener("error", () =>
    console.error("Database failed to open"),
  );
openRequest.addEventListener("success", () => {
    console.log("Database opened successfully");
    db = openRequest.result;
  });
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

//add a task to the list
textInput.addEventListener("change", () => {
    const text = textInput.value
    text.trim()
    const div = document.createElement("div")
    div.className = "view"
    const toggleButton = document.createElement("input")
    toggleButton.type = "checkbox"
    toggleButton.className = "toggle"
    const deleteButton = document.createElement("button")
    deleteButton.className = "destroy"
    const listItem = document.createElement("li")
    const label = document.createElement("label")
    label.textContent = text
    div.appendChild(toggleButton)
    div.appendChild(label)
    div.appendChild(deleteButton)
    listItem.appendChild(div)
    taskList.append(listItem)

    const newItem = { title: textInput.value,completed: toggleButton.value };
    let transaction = db.transaction(["todo_os"], "readwrite");
    const objectStore = transaction.objectStore("todo_os");
    const query = objectStore.add(newItem);
    query.onsuccess = (e) => {
        // Add id as an attribute to one of HTML elements
        listItem.setAttribute("meta-id", e.target.result)
        console.log('added', e.target.result)
    }
    transaction.addEventListener("complete", (e) => {
        console.log('complete', e)
        console.log("Transaction completed: database modification finished.");
      });
    
      transaction.addEventListener("error", () =>
        console.log("Transaction not opened due to error"),
      );

    textInput.value = ""
    textInput.focus()
    detectChange()

    //deleting a task
    deleteButton.addEventListener("click",removeTask)
    function removeTask() {
        listItem.remove()
        detectChange()

        const noteId = Number(listItem.getAttribute("meta-id"))
        transaction = db.transaction(["todo_os"], "readwrite");
        const objectStore = transaction.objectStore("todo_os");
        objectStore.delete(noteId);
        console.log(`Note ${noteId} deleted.`);

    }

    //marking the task as completed
    toggleButton.addEventListener("click",mark)
    function mark() {
        detectChange()
        if (!toggleButton.checked) {
            listItem.className = ""
        } else {
            listItem.className = "completed"
            clearCompleted.style.display = "block"
        }
    }

    //editing the content of the task
    label.addEventListener("dblclick", () => {
        listItem.className = "editing"
        const newText = document.createElement("input")
        newText.className = "edit"
        newText.type = "text"
        listItem.appendChild(newText)
        newText.focus()
        newText.addEventListener("change", () => {
            label.textContent = newText.value
            listItem.removeChild(newText)
            listItem.className = ""
        })
    })

    //button that marks all tasks as done
    let clickCounter = 0
    toggleAllCheckbox.addEventListener('change',() => {

            if (clickCounter === 0) {
                toggleButton.checked = true
                listItem.className = "completed"
                detectChange()
                clickCounter++
            }   else if (clickCounter === 1){
                toggleButton.checked = false
                listItem.className = ""
                detectChange()
                clickCounter--
            }
        } 
    )

    //button which deletes all completed tasks
    clearCompleted.addEventListener('click', () => {
        const checkk = document.querySelectorAll(".toggle")
        for (let i = 0; i<checkk.length;i++) {
            if (toggleButton.checked) toggleButton.addEventListener("click",removeTask())
        }
        detectChange()
    });
})