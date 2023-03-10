import { render, screen, fireEvent } from "@testing-library/react";
import { HashRouter } from "react-router-dom";
import Main from './main'

const setup = propOverrides => {
  const props = Object.assign({
    todos: [
      {
        text: 'Use Redux',
        completed: false,
        id: 0
      }, {
        text: 'Run the tests',
        completed: true,
        id: 1
      }
    ],
    actions: {
      editTodo: jest.fn(),
      deleteTodo: jest.fn(),
      toggleTodo: jest.fn(),
      toggleAll: jest.fn(),
      clearCompleted: jest.fn()
    }
  }, propOverrides)

  const {rerender} = render(<HashRouter><Main {...props} /></HashRouter>)

  return {
    props,
    rerender
  }
}

describe('components', () => {
  describe('Main', () => {
    it('should render container', async () => {
      setup();
      const main = await screen.queryByTestId("main");
      expect(main).toBeInTheDocument();
    })

    describe('toggle all input', () => {
      it('should render', async () => {
        setup();
        const toggle = await screen.queryByTestId("toggle-all");
        expect(toggle).toBeInTheDocument();
        expect(toggle.checked).toBeFalsy();
      })

      it('should be checked if all todos completed', async () => {
        setup({ todos: [
          {
            text: 'Use Redux',
            completed: true,
            id: 0
          }
        ]
        })
        const toggle = await screen.queryByTestId("toggle-all");
        expect(toggle).toBeInTheDocument();
        expect(toggle.checked).toBeTruthy();
      })

      it('should call toggleAll on change', async () => {
        const { props } = setup()
        const toggle = await screen.queryByTestId("toggle-all");
        fireEvent.click(toggle);
        expect(props.actions.toggleAll).toBeCalled()
      })
    })

    describe('footer', () => {
      it('should render', async () => {
        setup();
        const footer = await screen.queryByTestId("footer");
        expect(footer).toBeInTheDocument();

        const text = await screen.queryByText(/1 item left/i);
        expect(text).toBeInTheDocument();

        const clearButton = await screen.queryByText(/Clear completed/i);
        expect(clearButton).toBeInTheDocument();
      })

      it('onClearCompleted should call clearCompleted', async () => {
        const { props } = setup()
        const clearButton = await screen.queryByText(/Clear completed/i);
        expect(clearButton).toBeInTheDocument();
        fireEvent.click(clearButton);
        expect(props.actions.clearCompleted).toBeCalled();
      })
    })

    describe('todo list', () => {
      it('should render', async () => {
        setup()
        const list = await screen.queryByTestId(/todo-list/i);
        expect(list).toBeInTheDocument();
        const items = await screen.getAllByTestId("todo-item");
        expect(items.length).toEqual(2);
      })
    })
  })
})
