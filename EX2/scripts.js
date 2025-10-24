'use strict'

let groq_api_key = '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'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
}

let updateJSONbin = function () {
    let payLoad;
    if (todoList.length > 0) {
        payLoad = todoList;
    } else {
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
    let todoTableBody = document.querySelector("#todoTable tbody");
    let filterInput = document.getElementById("inputSearch");
    const startDateVal = document.getElementById("inputSearchDateStart").value;
    const endDateVal = document.getElementById("inputSearchDateEnd").value;

    // new Date("") zwraca Invalid Date, więc sprawdzamy, czy wartość istnieje (nie jest pusta)
    const dateStart = startDateVal ? new Date(startDateVal) : null;
    const dateEnd = endDateVal ? new Date(endDateVal) : null;

    if (dateStart) {
        dateStart.setHours(0, 0, 0, 0); // Ustaw na 00:00:00 danego dnia
    }
    if (dateEnd) {
        dateEnd.setHours(23, 59, 59, 999); // Ustaw na 23:59:59 danego dnia
    }

    // remove all elements
    todoTableBody.innerHTML = "";

    //add all elements
    todoList.forEach((todo, index) => {
        if (!todo || typeof todo.title === "undefined") {
            return;
        }

        // --- Filtr 1: Sprawdzenie tekstu ---
        let filterText = filterInput.value.toLowerCase();
        const textMatch = (filterText === "") ||
            (todo.title && todo.title.toLowerCase().includes(filterText)) ||
            (todo.description && todo.description.toLowerCase().includes(filterText));

        // --- Filtr 2: Sprawdzenie daty ---
        const todoDate = todo.dueDate ? new Date(todo.dueDate) : null;
        let dateMatch = false; // Domyślnie zakładamy, że nie pasuje

        const hasDateFilter = dateStart || dateEnd; // Czy jakikolwiek filtr daty jest aktywny?

        if (!hasDateFilter) {
            // Jeśli nie ma filtrów daty, element "pasuje" pod względem daty
            dateMatch = true;
        } else if (todoDate && !isNaN(todoDate.getTime())) {
            // Jeśli filtry daty są aktywne I element ma poprawną datę
            const afterStart = !dateStart || todoDate >= dateStart; // Pasuje, jeśli nie ma daty początkowej LUB todoDate jest po niej
            const beforeEnd = !dateEnd || todoDate <= dateEnd;   // Pasuje, jeśli nie ma daty końcowej LUB todoDate jest przed nią
            dateMatch = afterStart && beforeEnd;
        }
        // Jeśli filtry daty są aktywne, ale element nie ma daty (todoDate = null), dateMatch pozostaje false

        // Render row only if both text and date match
        if (textMatch && dateMatch) {
            // add the todoList
            let row = document.createElement("tr");
            let titleCell = document.createElement('td');
            titleCell.textContent = todo.title;
            titleCell.className = "font-weight-bold";

            let descriptionCell = document.createElement('td');
            descriptionCell.textContent = todo.description;
            descriptionCell.className = "text-break";

            let placeCell = document.createElement('td');
            placeCell.textContent = todo.place;

            let categoryCell = document.createElement('td');
            categoryCell.textContent = todo.category;

            let dueDateCell = document.createElement('td');
            dueDateCell.textContent = todoDate ? todoDate.toLocaleDateString() : "";
            dueDateCell.className = "text-nowrap";

            let deleteCell = document.createElement('td');
            deleteCell.className = "text-center";
            let deleteButton = document.createElement("button");
            deleteButton.className = "btn btn-danger"
            deleteButton.textContent = "X";
            deleteButton.addEventListener("click",
                function () {
                    deleteTodo(index);
                }
            );
            deleteCell.appendChild(deleteButton);

            // add all cells to row
            row.appendChild(titleCell);
            row.appendChild(descriptionCell);
            row.appendChild(placeCell);
            row.appendChild(categoryCell);
            row.appendChild(dueDateCell);
            row.appendChild(deleteCell);

            // add row to <tbody>
            todoTableBody.appendChild(row);
        }


    })
}

let addTodo = async function () {
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
    let category = await getCategory(newTitle, newDescription);

    //create new item
    let newTodo = {
        title: newTitle,
        description: newDescription,
        place: newPlace,
        category: category,
        dueDate: newDate
    };
    //add item to the list
    todoList.push(newTodo);
    updateJSONbin();
    updateTodoList();
}

let clearDateSearch = function () {
    const filterInputEl = document.getElementById("inputSearch");
    const startDateEl = document.getElementById("inputSearchDateStart");
    const endDateEl = document.getElementById("inputSearchDateEnd");

    filterInputEl.value = "";
    startDateEl.value = "";
    endDateEl.value = "";
    updateTodoList();
}

let getCategory = async function (title, description) {
    const ALLOWED_CATEGORIES = [
        "Praca", "Dom", "Zakupy", "Zdrowie i Fitness", "Finanse",
        "Rozwój osobisty", "Sprawy do załatwienia", "Rodzina i znajomi",
        "Hobby i relaks", "Inne"
    ];

    const systemPrompt = `Jesteś asystentem AI, który pomaga kategoryzować zadania. 
    Twoim zadaniem jest przypisać zadanie do jednej z podanych kategorii.
    Zwróć tylko i wyłącznie nazwę jednej kategorii, która najlepiej pasuje.
    Dostępne kategorie: ${ALLOWED_CATEGORIES.join(', ')}.
    Nie dodawaj żadnych wyjaśnień, wstępów ani zdań. Tylko nazwa kategorii.`;

    const userPrompt = `Tytuł zadania: ${title} \n Opis zadania: ${description}`;

    const requestBody = {
        model: "llama-3.1-8b-instant",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 20
    };

    try{

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${groq_api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            // Jeśli serwer odpowiedział błędem (np. zły klucz API)
            const errorDetails = await response.json(); // lub .text() jeśli to nie JSON
            console.error("Szczegóły błędu od Groq:", errorDetails);
        }

        const data = await response.json();

        // 6. Wyodrębnij kategorię z odpowiedzi
        let category = data.choices[0]?.message?.content;
        if (!category) {
            console.warn("Groq nie zwrócił treści, używam kategorii 'Inne'.");
            return "Inne";
        }

        category = category.trim();

        if (ALLOWED_CATEGORIES.includes(category)) {
            return category;
        } else {
            console.warn(`Groq zwrócił nieoczekiwaną kategorię: "${category}". Używam "Inne".`);
            return "Inne";
        }

    } catch (error) {
        console.error("Błąd podczas wywołania API Groq:", error);
        // W razie błędu API, zwróć bezpieczną, domyślną kategorię
        return "Inne";
    }
}


document.addEventListener("DOMContentLoaded", function () {
    loadInitialTodos();
    const filterInput = document.getElementById("inputSearch");
    if (filterInput) {
        filterInput.addEventListener("input", updateTodoList);
    }

    const inputSearchDateStart = document.getElementById("inputSearchDateStart");
    if (inputSearchDateStart) {
        inputSearchDateStart.addEventListener("change", updateTodoList);
    }

    const inputSearchDateEnd = document.getElementById("inputSearchDateEnd");
    if (inputSearchDateEnd) {
        inputSearchDateEnd.addEventListener("change", updateTodoList);
    }

});