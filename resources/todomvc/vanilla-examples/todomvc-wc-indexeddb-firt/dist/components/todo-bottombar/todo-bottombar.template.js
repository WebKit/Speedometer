const template = document.createElement("template");

template.id = "todo-bottombar-template";
template.innerHTML = `
    <footer class="bottombar" style="display:none">
        <style>
            .bottombar-content {
                display: flex;
                flex-direction: column;
            }
            .todo-status-container {
                display: grid;
                grid-template-columns: 2fr 3fr 2fr;
                align-items: center;
            }
            .todo-status-container > .todo-status {
                position: unset;
                transform: unset;
                grid-column-start: 1;
                grid-column-end: 2;
            }
            .todo-status-container > .page-buttons {
                position: unset;
                transform: unset;
                grid-column-start: 3;
                grid-column-end: 4;
            }
            .todo-status-container > .filter-list {
                position: unset;
                transform: unset;
                grid-column-start: 2;
                grid-column-end: 3;
            }
            
            .clear-completed-button, .clear-completed-button:active {
                position: unset !important;
                transform: unset !important;
            }
            .bottombar {
                height: unset !important;
            }

        </style>
        <div class= "bottombar-content"> 
            <div class = "todo-status-container">
                <div class="todo-status"><span class="todo-count">0</span> item left</div>
                <ul class="filter-list">
                    <li class="filter-item">
                        <a id="filter-link-all" class="filter-link selected" href="#/" data-route="all">All</a>
                    </li>
                    <li class="filter-item">
                        <a id="filter-link-active" class="filter-link" href="#/active" data-route="active">Active</a>
                    </li>
                    <li class="filter-item">
                        <a id="filter-link-completed" class="filter-link" href="#/completed" data-route="completed">Completed</a>
                    </li>
                </ul>
                <button id="clear-completed" class="clear-completed-button">Clear completed</button>
            </div>
            <div class = "page-buttons">
                <button id="first-page-button" class="page-button">First</button>
                <button id="previous-page-button" class="page-button">Prev</button>
                <button id="next-page-button" class="page-button">Next</button>
                <button id="last-page-button" class="page-button">Last</button>
            </div>
        </div>
    </footer>
`;

export default template;
