'use strict'
let todoList = [];
const X_Master_Key = "$2a$10$S4Sy/ZZbAm7MnEbloeT0..e8Uz/SJlrCtLkHY.rzfh1/WnurOX0mu";
const binUrl = "https://api.jsonbin.io/v3/b/68f90905ae596e708f246a1c";

// wczytanie danych z bazy JSONbin
let req = new XMLHttpRequest();

req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
        if (req.status == 200) {
            if (req.responseText) {
                try {
                    const response = JSON.parse(req.responseText);
                    if (response && response.record && Array.isArray(response.record)) {
                        todoList = response.record;
                        updateTodoList();
                    }
                } catch (e) {
                    console.error("Failed to parse JSON from server:", e);
                }
            } else {
                todoList = [];
                updateTodoList();
            }
        } else if (req.status == 404) { // Handle case where bin is new/empty
            console.log("Bin not found or is empty. Starting with a clean slate.");
            todoList = [];
            updateTodoList();
        }
    }
};

let loadInitialTodos = function () {
    req.open("GET", binUrl, true);
    req.setRequestHeader("X-Master-Key", X_Master_Key);
    req.send();
    todoList.push(req.responseText);
}

let updateJSONbin = function () {
    let payLoad;
    if (todoList.length > 0){
        payLoad = todoList;
    } else{
        payLoad = {record: todoList};
    }
    req.open("PUT", binUrl, true);
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader("X-Master-Key", X_Master_Key);
    req.send(JSON.stringify(payLoad));
}


let deleteTodo = function (index) {
    todoList.splice(index, 1);
    updateTodoList();
    updateJSONbin();
}


let updateTodoList = function () {
    let todoListDiv = document.getElementById("todoListView");

    //remove all elements
    while (todoListDiv.firstChild) {
        todoListDiv.removeChild(todoListDiv.firstChild);
    }

    //add all elements
    let filterInput = document.getElementById("inputSearch");

    for (let index in todoList) {
        const todo = todoList[index];
        // Defensively check if todo_ is a valid object with a title
        if (todo && typeof todo.title !== 'undefined') {
            if ((filterInput.value == "") || (todo.title.includes(filterInput.value)) || (todo.description && todo.description.includes(filterInput.value))) {
                // add the todoList
                let newElement = document.createElement("div");
                let newContent = document.createTextNode(
                    todo.title + " " + (todo.description || ""));
                newElement.appendChild(newContent);
                todoListDiv.appendChild(newElement);


                let newDeleteButton = document.createElement("input");
                newDeleteButton.type = "button";
                newDeleteButton.value = "x";
                newDeleteButton.addEventListener("click",
                    function () {
                        deleteTodo(index);
                    }
                );

                newElement.appendChild(newDeleteButton);
            }
        }
    }
}

let addTodo = function () {
    //get the elements in the form
    let inputTitle = document.getElementById("inputTitle");
    let inputDescription = document.getElementById("inputDescription");
    let inputPlace = document.getElementById("inputPlace");
    let inputDate = document.getElementById("inputDate");
    //get the values from the form
    let newTitle = inputTitle.value;
    let newDescription = inputDescription.value;
    let newPlace = inputPlace.value;
    let newDate = new Date(inputDate.value);
    //create new item
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        category: '',
        dueDate: newDate
    };
    //add item to the list
    todoList.push(newTodo);
    updateJSONbin();
}

loadInitialTodos();
setInterval(updateTodoList, 500);
