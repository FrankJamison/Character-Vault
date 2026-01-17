/**
 * @class ToDo
 *
 * Creates a list of tasks and updates a list
 */

class ToDo {
    tasks = [];
    tasksService;

    constructor(tasksService) {
        this.tasksService = tasksService;
    }

    init() {
        this.render();
    }

    /**
     * DOM renderer for building the list row item.
     * Uses bootstrap classes with some custom overrides.
     *
     * {@link https://getbootstrap.com/docs/4.4/components/list-group/}
     * @example
     * <li class="list-group-item">
     *   <button class="btn btn-secondary" onclick="deleteTask(e, index)">X</button>
     *   <span>Task name</span>
     *   <span>pending</span>
     *   <span>date create</span>
     * </li>
     */
    _renderListRowItem = (task) => {
        const listGroupItem = document.createElement('li');
        listGroupItem.id = `task-${task.task_id}`;
        listGroupItem.className = 'list-group-item';

        const deleteBtn = document.createElement('button');
        const deleteBtnTxt = document.createTextNode('X');
        deleteBtn.id = 'delete-btn';
        deleteBtn.className = 'btn btn-secondary';
        deleteBtn.addEventListener('click', this._deleteEventHandler(task.task_id));
        deleteBtn.appendChild(deleteBtnTxt);

        const taskNameSpan = document.createElement('span');
        const taskName = document.createTextNode(task.task_name);
        taskNameSpan.appendChild(taskName);

        const taskStatusSpan = document.createElement('span');
        const taskStatus = document.createTextNode(task.status);
        taskStatusSpan.append(taskStatus);

        const taskDateSpan = document.createElement('span');
        const taskDate = document.createTextNode(task.created_date);
        taskDateSpan.append(taskDate);

        // add list item's details
        listGroupItem.append(deleteBtn);
        listGroupItem.append(taskNameSpan);
        listGroupItem.append(taskStatusSpan);
        listGroupItem.append(taskDateSpan);

        return listGroupItem;
    };

    /**
     * DOM renderer for assembling the list items then mounting them to a parent node.
     */
    _renderList = () => {
        // get the "Loading..." text node from parent element
        const tasksDiv = document.getElementById('tasks');
        const loadingDiv = tasksDiv.childNodes[0];
        const fragment = document.createDocumentFragment();
        const ul = document.createElement('ul');
        ul.id = 'tasks-list';
        ul.className = 'list-group list-group-flush checked-list-box';

        this.tasks.map((task) => {
            const listGroupRowItem = this._renderListRowItem(task);

            // add entire list item
            ul.appendChild(listGroupRowItem);
        });

        fragment.appendChild(ul);
        tasksDiv.replaceChild(fragment, loadingDiv);
    };

    /**
     * DOM renderer for displaying a default message when a user has an empty list.
     */
    _renderMsg = () => {
        const tasksDiv = document.getElementById('tasks');
        const loadingDiv = tasksDiv.childNodes[0];
        const listParent = document.getElementById('tasks-list');
        const msgDiv = this._createMsgElement('Create some new tasks!');

        if (tasksDiv) {
            tasksDiv.replaceChild(msgDiv, loadingDiv);
        } else {
            tasksDiv.replaceChild(msgDiv, listParent);
        }
    };

    /**
     * Pure function for adding a task.
     *
     * @param {Object} newTask - form's values as an object
     */
    addTask = async (newTask) => {
        try {
            const {
                task_name,
                status
            } = newTask;
            const createdTask = await this.tasksService.addTask({
                task_name,
                status
            });

            if (!createdTask || createdTask.msg || !createdTask.task_id) {
                throw new Error(
                    (createdTask && createdTask.msg) ||
                    'Unable to add task (not authenticated)'
                );
            }

            // Use the server response so we keep the real task_id for later deletes.
            this.tasks.push(createdTask);
            return createdTask;
        } catch (err) {
            console.log(err);
            alert(err && err.message ? err.message : 'Unable to add task. Please try again later.');
            throw err;
        }
    };

    /**
     * DOM Event handler helper for adding a task to the DOM.
     *
     * @param {number} taskId - id of the task to delete
     */
    _addTaskEventHandler = async () => {
        const taskInput = document.getElementById('formInputTaskName');
        const task_name = taskInput.value;

        const statusSelect = document.getElementById('formSelectStatus');
        const options = statusSelect.options;
        const selectedIndex = statusSelect.selectedIndex;
        const status = options[selectedIndex].text;

        // validation checks
        if (!task_name) {
            alert('Please enter a task name.');
            return;
        }

        const task = {
            task_name,
            status
        }; // assemble the new task parts
        const createdTask = await this.addTask(task);

        // If the list isn't mounted yet (empty-state/loading), render from source-of-truth `this.tasks`.
        // (The created task is already in `this.tasks` via addTask.)
        const listParent = document.getElementById('tasks-list');
        if (!listParent) {
            this._renderList();
            taskInput.value = ''; // clear form text input
            return;
        }

        // Otherwise, append just the new row.
        listParent.appendChild(this._renderListRowItem(createdTask));

        taskInput.value = ''; // clear form text input
    };

    /**
     * Create the DOM element for the new task with all its parts.
     *
     * @param {Object} task - { task_name, status } partial status object
     */
    _createNewTaskEl = (task) => {
        const task_id = this.tasks.length;
        const created_date = new Date().toISOString();
        const newTask = {
            ...task,
            task_id,
            created_date
        };
        const newTaskEl = this._renderListRowItem(newTask);

        return {
            newTask,
            newTaskEl
        };
    };

    /**
     * Pure function for deleting a task.
     *
     * @param {number} taskId - id for the task to be deleted
     */
    deleteTask = async (taskId) => {
        try {
            const res = await this.tasksService.deleteTask(taskId);
            this.tasks = this.tasks.filter((task) => task.task_id !== taskId);

            if (res !== null) {
                alert('Task deleted successfully!');
            }
            return res;
        } catch (err) {
            alert('Unable to delete task. Please try again later.');
        }
    };

    /**
     * DOM Event handler helper for deleting a task from the DOM.
     * This relies on a pre-existing in the list of tasks.
     *
     * @param {number} taskId - id of the task to delete
     */
    _deleteEventHandler = (taskId) => () => {
        const task = document.getElementById(`task-${taskId}`);
        task.remove();

        this.deleteTask(taskId).then(() => {
            if (!this.tasks.length) {
                this._renderMsg();
            }
        });
    };

    /**
     * Creates a message div block.
     *
     * @param {string} msg - custom message to display
     */
    _createMsgElement = (msg) => {
        const msgDiv = document.createElement('div');
        const text = document.createTextNode(msg);
        msgDiv.id = 'user-message';
        msgDiv.className = 'center';
        msgDiv.appendChild(text);

        return msgDiv;
    };

    render = async () => {
        try {
            const tasks = await this.tasksService.getTasks();

            if (!Array.isArray(tasks)) {
                throw new Error(tasks && tasks.msg ? tasks.msg : 'Unable to load tasks');
            }

            if (tasks.length) {
                this.tasks = tasks;
                this._renderList();
            } else {
                this._renderMsg();
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };
}