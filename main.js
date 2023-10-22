class ToDo {
    #searchTaskField = document.querySelector("#search-task");
    #list = document.querySelector("#todo-list");
    #addTaskField = document.querySelector("#add-task");
    #addTaskDate = document.querySelector("#add-task-date");
    #addButton = document.querySelector("#add-button");
    #todayDate = new Date().toISOString().split('T')[0];

    constructor() {
        this.#addTaskDate.setAttribute('min', this.#todayDate);
        this.#setListeners();
        this.#loadTasks();
    }

    #addTask(task, date, checked = false) {
        if (!task && !date) {
            task = this.#addTaskField.value.trim();
            date = this.#addTaskDate.value;
        }
    
        if (!task || task.length < 3) {
            alert("You have to specify a task longer than 3 characters");
            return;
        } 
        if (task.length > 255) {
            alert("Your task is too long");
            return;
        }
    
        if (new Date(date) < new Date(this.#todayDate)) {
            alert("Task date cannot be in the past");
            return;
        }
    
        this.#list.appendChild(this.#createListElem(task, date, checked));
    
        this.#addTaskField.value = "";
        this.#addTaskDate.value = "";
    }

    #createListElem(task, date, checked) {
        let checkBox = document.createElement("input");
        checkBox.className = "checkbox";
        checkBox.type = "checkbox";
        checkBox.checked = checked;

        let taskValue = document.createElement("span");
        taskValue.innerText = task;
        taskValue.className = "task-value";
        
        let taskInput = document.createElement("input");
        taskInput.type = "text";
        taskInput.value = task;
        taskInput.className = "task-input"
        taskInput.style.display = "none";
        
        taskValue.addEventListener("click", () => {
            taskValue.style.display = "none";
            taskInput.style.display = "block";
            taskInput.focus();
        });

        const saveModifiedTaskValue = () => {
            const modifiedValue = taskInput.value.trim();
            taskValue.style.display = "block";
            taskInput.style.display = "none";
            
            if (!modifiedValue || modifiedValue.length < 3) {
                alert("You have to specify a task longer than 3 characters");
                taskInput.value = task;
                taskValue.innerText = task;
                return;
            } 

            if (modifiedValue.length > 255) {
                alert("Your task is too long");
                taskInput.value = task;
                taskValue.innerText = task;
                return;
            }
            
            task = modifiedValue;
            taskInput.value = modifiedValue;
            taskValue.innerText = modifiedValue;
        };

        taskInput.addEventListener("focusout", saveModifiedTaskValue);
        taskInput.addEventListener("keydown", (e) => {
            if (e.code === "Enter") {
                saveModifiedTaskValue();
            }
        });
        
        let dateValue = document.createElement("span");
        dateValue.innerText = date;
        dateValue.className = "date";
        
        let deleteButton = document.createElement("button");
        deleteButton.innerText = 'X';
        deleteButton.onclick = () => {
            this.#list.removeChild(listElem);
        }

        let listElem = document.createElement("li");
        listElem.appendChild(checkBox);
        listElem.appendChild(taskValue);
        listElem.appendChild(taskInput);
        listElem.appendChild(dateValue);
        listElem.appendChild(deleteButton);
        
        return listElem;
    }

    #searchForTask() {
        const searchValue = this.#searchTaskField.value;
        const taskList = Array.from(this.#list.childNodes);

        if (searchValue.length < 2) {
            for (let task of taskList) {
                const taskValue = task.querySelector(".task-value");
                const taskInputValue = task.querySelector(".task-input");
                taskValue.innerHTML = taskInputValue.value;
                task.style.display = "block";
                task.style.backgroundColor = "transparent";
            }

            return;
        }

        for (let task of taskList) {
            const taskValue = task.querySelector(".task-value");
            const taskInputValue = task.querySelector(".task-input");

            if (taskInputValue.value.includes(searchValue)) {
                task.style.display = "block";
                const splits = taskInputValue.value.split(searchValue);
                taskValue.innerHTML = `${splits[0]}<span style='background-color: lightblue;'>${searchValue}</span>${splits[1]}`;
            } else {
                task.style.display = "none";
                taskValue.innerHTML = taskInputValue.value;
            }
        }
    }

    saveTasks() {
        const tasksList = this.#list.childNodes;
        const tasksListToSave = [];
    
        for (let task of tasksList) {
            let checked = task.querySelector('.checkbox').checked;
    
            tasksListToSave.push({
                taskValue: task.querySelector(".task-input").value,
                date: task.querySelector(".date").innerText,
                checked: checked
            });
        }
    
        localStorage.setItem("tasks", JSON.stringify(tasksListToSave));
    }

    #loadTasks() {
        const loadedTasks = Array.from(JSON.parse(localStorage.getItem("tasks")));

        for (let task of loadedTasks) {
            this.#addTask(task.taskValue, task.date, task.checked);
        }
    }

    #setListeners() {
        const self = this;
        this.#addButton.addEventListener("click", () => self.#addTask());
        this.#addTaskField.addEventListener("keydown", e => {
            if (e.code === "Enter") {
                self.#addTask();
            }
        });
        this.#searchTaskField.addEventListener("keyup", this.#searchForTask.bind(self));
    }
}

const todo = new ToDo();

window.onbeforeunload = () => {
    todo.saveTasks();
}

window.onclose = () => {
    todo.saveTasks();
}