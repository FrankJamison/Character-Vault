// This project uses multiple standalone pages that share a single script include.
// Only initialize the features that exist on the current page.

// Characters page
if (typeof CharactersService !== 'undefined' && typeof CharacterList !== 'undefined') {
    const charactersService = new CharactersService();
    // Expose for characters.js event handlers
    window.characterList = new CharacterList(charactersService);
    window.characterList.init();
}

// Tasks page
if (typeof TasksService !== 'undefined' && typeof ToDo !== 'undefined') {
    const tasksService = new TasksService();
    // Expose for todo.js event handlers
    window.todo = new ToDo(tasksService);
    window.todo.init();
}