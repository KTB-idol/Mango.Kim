class Task {
  constructor(title, description, createdAt, status) {
    this.id = `task-${new Date().getTime()}`;
    this.title = title;
    this.status = status;
    this.description = description;
    this.createdAt = createdAt;
    this.modifiedAt = createdAt;
  }

  updateTask(title, description) {
    this.title = title;
    this.description = description;
    this.modifiedAt = new Date();
  }
}

class TaskManager {
  constructor() {
    this.todo = new Array();
    this.progress = new Array();
    this.done = new Array();
  }

  loadTasksFromLocalStorage(data) {
    const addTask = (taskData, list) => {
      const { id, title, description, createdAt, modifiedAt } = taskData;
      const task = new Task(id, title, description, createdAt, modifiedAt);
      list.push(task);
    };

    data.todo?.forEach((taskData) => addTask(taskData, this.todo));
    data.progress?.forEach((taskData) => addTask(taskData, this.progress));
    data.done?.forEach((taskData) => addTask(taskData, this.done));
  }

  addNewTask(newTask) {
    this.todo.unshift(newTask);
  }

  updateTodoTask(taskId, title, description) {
    const task = this.getTodoById(taskId);
    if (task) {
      task.updateTask(title, description);
      const index = this.todo.indexOf(task);
      if (index > -1) {
        this.todo.splice(index, 1);
      }
      this.todo.unshift(task);
    }
  }

  updateProgressTask(taskId, title, description) {
    const task = this.getProgressById(taskId);
    if (task) {
      task.updateTask(title, description);
      const index = this.progress.indexOf(task);
      if (index > -1) {
        this.todo.splice(index, 1);
      }
      this.todo.unshift(task);
    }
  }

  updateDoneTask(taskId, title, description) {
    const task = this.getProgressById(taskId);
    if (task) {
      task.updateTask(title, description);
      const index = this.done.indexOf(task);
      if (index > -1) {
        this.todo.splice(index, 1);
      }
      this.todo.unshift(task);
    }
  }

  removeTodoById(taskId) {
    this.getTodoById(taskId);
    const index = this.todo.indexOf(todo);
    if (index > -1) {
      this.todo.splice(index, 1);
    }
  }

  removeProgressById(taskId) {
    const task = this.getProgressById(taskId);
    const index = this.progress.indexOf(task);
    if (index > -1) {
      this.progress.splice(index, 1);
    }
  }

  removeDoneById(taskId) {
    const task = this.getDoneById(taskId);
    const index = this.done.indexOf(task);
    if (index > -1) {
      this.done.splice(index, 1);
    }
  }

  getTodoById(taskId) {
    this.todo.find((task) => task.id === taskId);
  }

  getProgressById(taskId) {
    this.progress.find((task) => task.id === taskId);
  }

  getDoneById(taskId) {
    this.done.find((task) => task.id === taskId);
  }

  byModifiedAtDesc(a, b) {
    return b.modifiedAt - a.modifiedAt;
  }
}

/////////////////////////////////////////////////////////

const taskData = new TaskManager();

if (typeof Storage !== "undefined") {
  const data = localStorage.getItem("taskData");
  if (data) {
    taskData.loadTasksFromLocalStorage(data);
    console.log("Data retrieved from local storage:", data);
  } else {
    console.log("No data found in local storage");
    localStorage.setItem("taskData", taskData);
    console.log("Data saved to local storage:", taskData);
  }
} else {
  console.log("Local storage is not supported");
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("todoModal");
  const openCreateModalBtn = document.getElementById("openCreateModalBtn");
  const openEditModalBtn = document.getElementById("openEditModalBtn");
  const modalCloseBtn = document.getElementsByClassName("close")[0];

  const openModal = (modalType, task) => {
    console.log("opened Mdoal");
    modal.style.display = "block";
    const taskTitle = document.getElementById("taskTitle");
    const taskDescription = document.getElementById("taskDescription");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const editTaskBtn = document.getElementById("editTaskBtn");
    const deleteTaskBtn = document.getElementById("deleteTaskBtn");
    const modalForm = document.getElementById("modalForm");

    modalForm.addEventListener("click", function (event) {
      if (event.target.tagName === "BUTTON") {
        event.preventDefault();

        const buttonId = event.target.id;

        switch (buttonId) {
          case "addTaskBtn":
            addTaskBtnClickHandler();
            console.log("Add button clicked");
            break;
          case "editTaskBtn":
            // Edit 버튼이 클릭되었을 때 실행될 코드
            editTaskBtnClickHandler(task, task.title, task.description);
            console.log("Edit button clicked");
            break;
          case "deleteTaskBtn":
            // Delete 버튼이 클릭되었을 때 실행될 코드
            deleteTaskBtnClickHandler(task.id, task.title, task.description);
            modal.style.display = "none";
            console.log("Delete button clicked");
            break;
          default:
            console.log("Unknown button clicked");
            break;
        }
      }
    });

    switch (modalType) {
      case "add":
        taskTitle.value = "";
        taskDescription.value = "";
        addTaskBtn.style.display = "block";
        editTaskBtn.style.display = "none";
        deleteTaskBtn.style.display = "none";
        break;
      case "edit":
        taskTitle.value = task.title;
        taskDescription.value = task.description;
        addTaskBtn.style.display = "none";
        editTaskBtn.style.display = "block";
        deleteTaskBtn.style.display = "block";
        break;
      default:
        console.log("Unknown modal type");
        break;
    }
  };

  const closeModal = () => {
    modal.style.display = "none";
  };

  const addTaskElementToTodoList = (task) => {
    const todoList = document.getElementById("todoList");
    const li = document.createElement("li");
    const leftTriangleButton = document.createElement("button");
    leftTriangleButton.classList.add("left-triangle-button");
    const taskTitle = document.createElement("div");
    taskTitle.textContent = task.title;
    taskTitle.onclick = function () {
      openModal("edit", task);
    };
    const rightTriangleButton = document.createElement("button");
    rightTriangleButton.classList.add("right-triangle-button");
    li.appendChild(leftTriangleButton);
    li.appendChild(taskTitle);
    li.appendChild(rightTriangleButton);
    todoList.insertBefore(li, todoList.firstChild);
  };

  const updateTaskElement = (task) => {
    const taskElement = document.getElementById(task.id);
    if (taskElement) {
      taskElement.remove();
    }
    addTaskElementToTodoList(task);
  };

  const addTaskBtnClickHandler = () => {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const createdAt = new Date();
    const newTask = new Task(title, description, createdAt, "todo");
    taskData.addNewTask(newTask);

    modal.style.display = "none";
    addTaskElementToTodoList(newTask);
  };

  const editTaskBtnClickHandler = (task) => {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;

    switch (task.status) {
      case "todo":
        taskData.updateTodoTask(task.id, title, description);
        break;
      case "progress":
        taskData.updateProgressTask(task.id, title, description);
        break;
      case "done":
        taskData.updateDoneTask(task.id, title, description);
        break;
    }

    updateTaskElement(task);
  };

  // 생성 모달 열기
  openCreateModalBtn.onclick = function () {
    openModal("add", null);
  };

  // 수정 모달 열기
  openEditModalBtn.onclick = function (event) {
    const parentLi = event.target.closest("li");
    const parentUl = parentLi.closest("ul");
    const taskId = parentLi.id;
    let task;
    switch (parentUl.id) {
      case "todoList":
        task = taskData.getTodoById(taskId);
        break;
      case "progressList":
        task = taskData.getProgressById(taskId);
        break;
      case "doneList":
        task = taskData.getDoneById(taskId);
        break;
    }
    openModal("edit", task);
  };

  // 모달 닫기
  modalCloseBtn.onclick = closeModal;

  // 모달 외부 클릭 시 닫기
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };
});
