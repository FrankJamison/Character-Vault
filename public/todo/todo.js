/**
 * AJAX add new tasks to task list on save.
 */
const doAddTask = async (e) => {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    if (!window.todo) {
        alert('Tasks page is still initializing. Please refresh and try again.');
        return;
    }

    try {
        await window.todo._addTaskEventHandler();
    } catch (err) {
        // Error alerts are handled in the service; avoid unhandled promise rejections.
        console.log(err);
    }
};