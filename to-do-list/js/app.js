const input = document.querySelector(".new-todo")
const list = document.querySelector(".todo-list")
const doneButton = document.querySelector(".toggle")
const main = document.querySelector(".main")
const footer = document.querySelector(".footer")
const li = document.querySelector("li")
const destroyButton = document.querySelector(".destroy")
const count = document.querySelector(".todo-count")
const toggleAllCheckbox = document.querySelector('toggle-all');
const clearCompleted = document.querySelector('.clear-completed')
clearCompleted.style.display = "none"


function check() {
    if (counter > 1){
        return count.textContent = counter + " items left"
    }else {
        return count.textContent = counter + " item left"
    }
}
let counter = 0
check()

if (document.querySelector("ul").innerHTML.trim() == "") {
    main.style.display = "none"
    footer.style.display = "none"
} 
// let db
// const openRequest = window.indexedDB.open("todo_db", 1);
// openRequest.addEventListener("error", () =>
//     console.error("Database failed to open"),
//   );
// openRequest.addEventListener("success", () => {
//     console.log("Database opened successfully");
//     db = openRequest.result;
//   });
// openRequest.addEventListener("upgradeneeded", (e) => {
//   db = e.target.result;


//   const objectStore = db.createObjectStore("todo_os", {
//     keyPath: "id",
//     autoIncrement: true,
//   });

//   objectStore.createIndex("title", "title", { unique: false });
//   objectStore.createIndex("body", "body", { unique: false });

//   console.log("Database setup complete");
// });

input.addEventListener("change", () => {
    const text = input.value
    text.trim()
    main.style.display = "block"
    footer.style.display = "block"
    const div = document.createElement("div")
    div.className = "view"
    const doneButton = document.createElement("input")
    doneButton.type = "checkbox"
    doneButton.className = "toggle"
    const destroyButton = document.createElement("button")
    destroyButton.className = "destroy"
    const li = document.createElement("li")
    const label = document.createElement("label")
    label.textContent = text
    div.appendChild(doneButton)
    div.appendChild(label)
    div.appendChild(destroyButton)
    li.appendChild(div)
    list.append(li)
    input.value = ""
    input.focus()
    counter +=1
    check()

    // const newItem = { title: input.value, completed: doneButton.value };
    // const transaction = db.transaction(["todo_os"], "readwrite");
    // const objectStore = transaction.objectStore("todo_os");
  
    // const addRequest = objectStore.add(newItem);

    destroyButton.addEventListener("click",removeTask)
    function removeTask() {
        list.removeChild(li)
        counter -=1
        check()
        if (document.querySelector("ul").innerHTML.trim() == "") {
            main.style.visibility = "hidden"
            footer.style.visibility = "hidden"
        } 
    }

    doneButton.addEventListener("click",(e) => {
        if (!doneButton.checked) {
            e.target.parentNode.parentNode.className = ""
        } else {
            e.target.parentNode.parentNode.className = "completed"
        }
    })

    label.addEventListener("dblclick", () => {
        const newText = document.createElement("input")
        newText.type = "text"
        div.removeChild(destroyButton)
        div.removeChild(doneButton)
        div.appendChild(newText)
        newText.focus()
        newText.addEventListener("change", () => {
            label.textContent = newText.value
            div.removeChild(newText)
            div.appendChild(doneButton)
            div.appendChild(label)
            div.appendChild(destroyButton)
        })
    })


    toggleAllCheckbox.addEventListener('change',() => {
        const listItems = document.querySelectorAll("li")
            for (let i =0;i<list.length;i++) {
            }
    })

    // clearCompleted.addEventListener('change', () => {
       
    // });
})


// (function (window) {
// 	'use strict';

// 	// Your starting point. Enjoy the ride!

// })(window);

