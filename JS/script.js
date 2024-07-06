const TaskStatus = {
  TODO: "todo",
  PROGRESS: "progress",
  DONE: "done",

  getNext: function (status) {
    switch (status) {
      case this.TODO:
        return this.PROGRESS;
      case this.PROGRESS:
        return this.DONE;
      case this.DONE:
        return this.DONE;
      default:
        return this.TODO;
    }
  },

  getPrev: function (status) {
    switch (status) {
      case this.DONE:
        return this.PROGRESS;
      case this.PROGRESS:
        return this.TODO;
      case this.TODO:
        return this.TODO;
      default:
        return this.TODO;
    }
  },
};

class Task {
  constructor(title, description, createdAt, status = TaskStatus.TODO) {
    this.id = `task-${this.generateUUID()}`;
    this.title = title;
    this.description = description;
    this.status = status;
    this.createdAt = createdAt;
    this.modifiedAt = createdAt;
  }

  updateTask(title, description) {
    this.title = title;
    this.description = description;
    this.modifiedAt = new Date();
  }

  generateUUID = () => {
    return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

class TaskManager {
  constructor() {
    this.todo = [];
    this.progress = [];
    this.done = [];

    this.loadTasksFromLocalStorage();
  }

  loadTasksFromLocalStorage() {
    if (typeof localStorage !== "undefined") {
      const data = JSON.parse(localStorage.getItem("taskData"));
      if (data) {
        const addTask = (taskData, list) => {
          const { id, title, description, status, createdAt, modifiedAt } =
            taskData;
          const task = new Task(
            title,
            description,
            new Date(createdAt),
            status
          );
          task.id = id;
          task.modifiedAt = new Date(modifiedAt);
          list.push(task);
        };

        data.todo.forEach((taskData) => addTask(taskData, this.todo));
        data.progress.forEach((taskData) => addTask(taskData, this.progress));
        data.done.forEach((taskData) => addTask(taskData, this.done));
      }
    }
  }

  addNewTask(newTask) {
    this.todo.unshift(newTask);
    this.saveToLocalStorage();
  }

  moveTaskStatusNext(taskId) {
    const task =
      this.getTaskById(this.todo, taskId) ||
      this.getTaskById(this.progress, taskId);
    if (task) {
      const currentStatus = task.status;
      const nextStatus = TaskStatus.getNext(currentStatus);
      task.status = nextStatus;

      switch (currentStatus) {
        case TaskStatus.TODO:
          this.removeTaskFromList(this.todo, task);
          break;
        case TaskStatus.PROGRESS:
          this.removeTaskFromList(this.progress, task);
          break;
        default:
          break;
      }

      switch (nextStatus) {
        case TaskStatus.TODO:
          this.todo.unshift(task);
          break;
        case TaskStatus.PROGRESS:
          this.progress.unshift(task);
          break;
        case TaskStatus.DONE:
          this.done.unshift(task);
          break;
        default:
          break;
      }

      this.saveToLocalStorage();
    }
    return task;
  }

  moveTaskStatusPrev(taskId) {
    const task =
      this.getTaskById(this.progress, taskId) ||
      this.getTaskById(this.done, taskId);
    if (task) {
      const currentStatus = task.status;
      const prevStatus = TaskStatus.getPrev(currentStatus);
      task.status = prevStatus;

      switch (currentStatus) {
        case TaskStatus.PROGRESS:
          this.removeTaskFromList(this.progress, task);
          break;
        case TaskStatus.DONE:
          this.removeTaskFromList(this.done, task);
          break;
        default:
          break;
      }

      switch (prevStatus) {
        case TaskStatus.TODO:
          this.todo.unshift(task);
          break;
        case TaskStatus.PROGRESS:
          this.progress.unshift(task);
          break;
        default:
          break;
      }

      this.saveToLocalStorage();
    }
    return task;
  }

  updateTask(list, taskId, title, description) {
    const task = list.find((task) => task.id === taskId);
    if (task) {
      task.updateTask(title, description);
      const index = list.indexOf(task);
      if (index > -1) {
        list.splice(index, 1);
      }
      list.unshift(task);
      this.saveToLocalStorage();
    }
  }

  updateTodoTask(taskId, title, description) {
    this.updateTask(this.todo, taskId, title, description);
  }

  updateProgressTask(taskId, title, description) {
    this.updateTask(this.progress, taskId, title, description);
  }

  updateDoneTask(taskId, title, description) {
    this.updateTask(this.done, taskId, title, description);
  }

  removeTaskFromList(list, task) {
    const index = list.indexOf(task);
    if (index > -1) {
      list.splice(index, 1);
      this.saveToLocalStorage();
    }
  }

  removeTaskById(taskId) {
    const task = list.find((task) => task.id === taskId);
    switch (task.status) {
      case TaskStatus.TODO:
        this.removeTaskFromList(this.todo, task);
        break;
      case TaskStatus.PROGRESS:
        this.removeTaskFromList(this.progress, task);
        break;
      case TaskStatus.DONE:
        this.removeTaskFromList(this.done, task);
        break;
      default:
        break;
    }
  }

  getTaskById(list, taskId) {
    return list.find((task) => task.id === taskId);
  }

  getTodoById(taskId) {
    return this.getTaskById(this.todo, taskId);
  }

  getProgressById(taskId) {
    return this.getTaskById(this.progress, taskId);
  }

  getDoneById(taskId) {
    return this.getTaskById(this.done, taskId);
  }

  saveToLocalStorage() {
    const data = {
      todo: this.todo,
      progress: this.progress,
      done: this.done,
    };
    localStorage.setItem("taskData", JSON.stringify(data));
  }
}

/////////////////////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
  const taskManager = new TaskManager();
  const modal = document.getElementById("todoModal");
  const openCreateModalBtn = document.getElementById("openCreateModalBtn");
  const closeModalBtn = document.querySelector(".close");
  const modalForm = document.getElementById("modalForm");
  const taskTitle = document.getElementById("taskTitle");
  const taskDescription = document.getElementById("taskDescription");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const editTaskBtn = document.getElementById("editTaskBtn");
  const deleteTaskBtn = document.getElementById("deleteTaskBtn");
  const todoList = document.getElementById("todoList");
  const progressList = document.getElementById("progressList");
  const doneList = document.getElementById("doneList");

  let selectedTaskId = null;

  const openModal = (modalType, task = null) => {
    modal.style.display = "block";
    switch (modalType) {
      case "add":
        taskTitle.value = "";
        taskDescription.value = "";
        selectedTaskId = null;
        addTaskBtn.style.display = "block";
        editTaskBtn.style.display = "none";
        deleteTaskBtn.style.display = "none";
        break;
      case "edit":
        if (task) {
          taskTitle.value = task.title;
          taskDescription.value = task.description;
          selectedTaskId = task.id;
          addTaskBtn.style.display = "none";
          editTaskBtn.style.display = "block";
          deleteTaskBtn.style.display = "block";
        }
        break;
      default:
        console.log("Unknown modal type");
        break;
    }
  };

  const closeModal = () => {
    modal.style.display = "none";
  };

  const addTaskBtnClickHandler = () => {
    const title = taskTitle.value;
    const description = taskDescription.value;
    const createdAt = new Date();
    const newTask = new Task(title, description, createdAt, TaskStatus.TODO);
    taskManager.addNewTask(newTask);
    addTaskToDOM(newTask, todoList);
    closeModal();
  };

  const editTaskBtnClickHandler = () => {
    const title = taskTitle.value;
    const description = taskDescription.value;
    const taskElement = document.getElementById(selectedTaskId);

    taskElement.querySelector("div").textContent = title;
    closeModal();
  };

  const deleteTaskBtnClickHandler = () => {
    removeTaskFromDOM(selectedTaskId);
    taskManager.removeTaskById(selectedTaskId);
    closeModal();
  };

  const addTaskToDOM = (task, list) => {
    const li = document.createElement("li");
    li.id = task.id;

    const taskDiv = document.createElement("div");
    taskDiv.textContent = task.title;
    taskDiv.addEventListener("click", () => openModal("edit", task));
    li.appendChild(taskDiv);

    if (task.status === TaskStatus.TODO) {
      console.log("task.status", task.status);
      const rightTriangleButton = document.createElement("button");
      rightTriangleButton.addEventListener("click", moveNextBtnClickHandler);
      rightTriangleButton.classList.add("right-triangle-button");

      li.appendChild(rightTriangleButton);
    } else if (task.status === TaskStatus.PROGRESS) {
      console.log("task.status", task.status);
      const leftTriangleButton = document.createElement("button");
      leftTriangleButton.addEventListener("click", movePrevBtnClickHandler);
      leftTriangleButton.classList.add("left-triangle-button");
      li.prepend(leftTriangleButton);

      const rightTriangleButton = document.createElement("button");
      rightTriangleButton.classList.add("right-triangle-button");
      rightTriangleButton.addEventListener("click", moveNextBtnClickHandler);
      li.appendChild(rightTriangleButton);
    } else if (task.status === TaskStatus.DONE) {
      const leftTriangleButton = document.createElement("button");
      leftTriangleButton.addEventListener("click", movePrevBtnClickHandler);
      leftTriangleButton.classList.add("left-triangle-button");
      li.prepend(leftTriangleButton);
    }

    list.prepend(li);
  };

  const removeTaskFromDOM = (taskId) => {
    const taskElement = document.getElementById(taskId);
    taskElement?.remove();
  };

  const movePrevBtnClickHandler = (event) => {
    const taskId = event.target.closest("li").id;
    const task = taskManager.moveTaskStatusPrev(taskId);
    removeTaskFromDOM(task.id);

    switch (task.status) {
      case TaskStatus.TODO:
        addTaskToDOM(task, todoList);
        break;
      case TaskStatus.PROGRESS:
        addTaskToDOM(task, progressList);
        break;
      case TaskStatus.DONE:
        addTaskToDOM(task, doneList);
        break;
      default:
        break;
    }
  };

  const moveNextBtnClickHandler = (event) => {
    const taskId = event.target.closest("li").id;
    const task = taskManager.moveTaskStatusNext(taskId);
    removeTaskFromDOM(task.id);

    switch (task.status) {
      case TaskStatus.TODO:
        addTaskToDOM(task, todoList);
        break;
      case TaskStatus.PROGRESS:
        addTaskToDOM(task, progressList);
        break;
      case TaskStatus.DONE:
        addTaskToDOM(task, doneList);
        break;
      default:
        break;
    }
  };

  openCreateModalBtn.onclick = () => openModal("add");
  closeModalBtn.onclick = closeModal;

  addTaskBtn.addEventListener("click", (event) => {
    event.preventDefault();
    addTaskBtnClickHandler();
  });

  editTaskBtn.addEventListener("click", (event) => {
    event.preventDefault();
    editTaskBtnClickHandler();
  });

  deleteTaskBtn.addEventListener("click", (event) => {
    event.preventDefault();
    deleteTaskBtnClickHandler();
  });

  console.log(taskManager);

  taskManager.todo.forEach((task) => addTaskToDOM(task, todoList));
  taskManager.progress.forEach((task) => addTaskToDOM(task, progressList));
  taskManager.done.forEach((task) => addTaskToDOM(task, doneList));
});
