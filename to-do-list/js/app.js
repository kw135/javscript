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




// window.addEventListener('load', ()=> {
//     const request = db.transaction("todo_os", "readonly")
//     .objectStore("todo_os")
//     .getAll();
//         request.onsuccess = (e) => {
//             const todos = e.target.result;
//             todos.forEach((todo) => {
//             const div = document.createElement("div")
//             div.className = "view"
//             const toggleButton = document.createElement("input")
//             toggleButton.type = "checkbox"
//             toggleButton.className = "toggle"
//             toggleButton.checked = todo.completed
//             const deleteButton = document.createElement("button")
//             deleteButton.className = "destroy"
//             const listItem = document.createElement("li")
//             listItem.setAttribute("meta-id", todo.id)
//             todo.completed? listItem.className = "completed" : listItem.className = ""
//             const label = document.createElement("label")
//             label.textContent = todo.title
//             div.appendChild(toggleButton)
//             div.appendChild(label)
//             div.appendChild(deleteButton)
//             listItem.appendChild(div)
//             taskList.append(listItem)
// })//pop
// }})

displayElements()
function monitorListChanges() {
    //wywoluje sie kiedy zmieni sie liczba li
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

function monitorListClassChanges() { //pop
    //wywoluje sie gdy zmieni sie klasa li
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (mutation.target.className === 'completed') {
                    clearCompleted.style.display = "block"
                } else {
                    clearCompleted.style.display = "none"
                }
            }
        }
    });
    observer.observe(taskList, { childList: true, attributes: true, attributeFilter: ['class'], subtree: true});

}
monitorListClassChanges();

function checkAmount() {
    let todosCount = document.querySelectorAll("li").length - 3
    if (todosCount > 1){
        return count.textContent = todosCount + " items left"
    }else {
        return count.textContent = todosCount + " item left"
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

    const newItem = { title: textInput.value,completed: false };
    let transaction = db.transaction(["todo_os"], "readwrite");
    const objectStore = transaction.objectStore("todo_os");
    const query = objectStore.add(newItem);
    query.onsuccess = (e) => {
        // Add id as an attribute to one of HTML elements
        console.log('added', e.target.result)
        listItem.setAttribute("meta-id", e.target.result)
    }
    transaction.addEventListener("complete", (e) => {
        console.log("Transaction completed: database modification finished.");
      });
    
      transaction.addEventListener("error", () =>
        console.log("Transaction not opened due to error"),
      );
      
    textInput.value = ""
    textInput.focus()
    //pop
    //deleting a task
    deleteButton.addEventListener("click",removeTask)
    function removeTask() {
        listItem.remove()
        const noteId = Number(listItem.getAttribute("meta-id"))
        transaction = db.transaction(["todo_os"], "readwrite");
        const objectStore = transaction.objectStore("todo_os");
        objectStore.delete(noteId);
        console.log(`Note ${noteId} deleted.`);
    }

    //marking the task as completed
    toggleButton.addEventListener("click",mark)
    function mark() {
        const key = Number(listItem.getAttribute("meta-id"))
        if (!toggleButton.checked) {
            listItem.className = ""
            updateStatus(key, false);
        } else {
            listItem.className = "completed"
            clearCompleted.style.display = "block"
            updateStatus(key, true);
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
                clickCounter++
            }   else if (clickCounter === 1){
                toggleButton.checked = false
                listItem.className = ""
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
        clearCompleted.style.display = "none"
    });
window.addEventListener('DOMContentLoaded', loadPreviousTasks())
function loadPreviousTasks() {
    const request = db.transaction("todo_os", "readonly")
                    .objectStore("todo_os")
                    .getAll();
    request.onsuccess = (e) => {
        const todos = e.target.result;
        todos.forEach((todo) => {
            const div = document.createElement("div")
            div.className = "view"
            const toggleButton = document.createElement("input")
            toggleButton.type = "checkbox"
            toggleButton.className = "toggle"
            toggleButton.checked = todo.completed
            const deleteButton = document.createElement("button")
            deleteButton.className = "destroy"
            const listItem = document.createElement("li")
            listItem.setAttribute("meta-id", todo.id)
            todo.completed? listItem.className = "completed" : listItem.className = ""
            const label = document.createElement("label")
            label.textContent = todo.title
            div.appendChild(toggleButton)
            div.appendChild(label)
            div.appendChild(deleteButton)
            listItem.appendChild(div)
            taskList.append(listItem)
            //pop
            //deleting a task
            deleteButton.addEventListener("click",removeTask)
            function removeTask() {
                listItem.remove()
                const noteId = Number(listItem.getAttribute("meta-id"))
                transaction = db.transaction(["todo_os"], "readwrite");
                const objectStore = transaction.objectStore("todo_os");
                objectStore.delete(noteId);
                console.log(`Note ${noteId} deleted.`);
            }

            //marking the task as completed
            toggleButton.addEventListener("click",mark)
            function mark() {
                const key = Number(listItem.getAttribute("meta-id"))
                if (!toggleButton.checked) {
                    listItem.className = ""
                    updateStatus(key, false);
                } else {
                    listItem.className = "completed"
                    clearCompleted.style.display = "block"
                    updateStatus(key, true);
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
                    const key = Number(listItem.getAttribute("meta-id"))
                    label.textContent = newText.value
                    updateTitle(key, newText.value);
                    listItem.removeChild(newText)
                    listItem.className = ""
                })
            })

            //button that marks all tasks as done
            let clickCounter = 0
            toggleAllCheckbox.addEventListener('change',() => {
                const key = Number(listItem.getAttribute("meta-id"))
                    if (clickCounter === 0) {
                        toggleButton.checked = true
                        updateStatus(key, true);
                        listItem.className = "completed"
                        clickCounter++
                    }   else if (clickCounter === 1){
                        toggleButton.checked = false
                        updateStatus(key, false);
                        listItem.className = ""
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
                clearCompleted.style.display = "none"
            });
            
        });
    request.onerror = (e) => {
        console.error("Error getting todos from database", e);
        }
    }
    }
})
function updateStatus(key,value){//pop
    const objectStore = db.transaction('todo_os', "readwrite")
                          .objectStore('todo_os');
    const request = objectStore.get(key);
    request.onsuccess = ()=> {
        let check = request.result;
        check.completed = value;
        // Create a request to update
        const updateRequest = objectStore.put(check);
        updateRequest.onsuccess = () => {
            console.log(request.result)
        }
    }
}
function updateTitle(key,value){//pop
    const objectStore = db.transaction('todo_os', "readwrite")
                          .objectStore('todo_os');
    const request = objectStore.get(key);
    request.onsuccess = ()=> {
        let check = request.result;
        check.title = value;
        const updateRequest = objectStore.put(check);
        updateRequest.onsuccess = () => {
            console.log(request.result)
        }
    }
}