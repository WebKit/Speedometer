import React from 'react'
import { render, screen, fireEvent } from "@testing-library/react";
import MainSection from './MainSection'
import TodoItem from './TodoItem'
import Footer from './Footer'
import { SHOW_ALL, SHOW_COMPLETED } from '../constants/TodoFilters'

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
      completeTodo: jest.fn(),
      completeAll: jest.fn(),
      clearCompleted: jest.fn()
    }
  }, propOverrides)

  const {rerender} = render(<MainSection {...props} />)

  return {
    props,
    rerender
  }
}

describe('components', () => {
  describe('MainSection', () => {
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

      it('should call completeAll on change', async () => {
        const { props } = setup()
        const toggle = await screen.queryByTestId("toggle-all");
        fireEvent.click(toggle);
        expect(props.actions.completeAll).toBeCalled()
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

      it('onShow should set the filter', async () => {
        const { rerender, props } = setup();

        const todoOne = await screen.queryByText(/Use Redux/i);
        expect(todoOne).toBeInTheDocument();

        const todoTwo = await screen.queryByText(/Run the tests/i);
        expect(todoTwo).toBeInTheDocument();

        const activeLink = await screen.queryByText(/Active/i);
        expect(activeLink).toBeInTheDocument();
        fireEvent.click(activeLink);

        rerender(<MainSection {...props} />)

        const after = await screen.queryByText(/Run the tests/i);
        expect(after).not.toBeInTheDocument();
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

      it('should filter items', async () => {
        setup()
        const before = await screen.getAllByTestId("todo-item");
        expect(before.length).toEqual(2);
        const completedLink = await screen.queryByText("Completed");
        expect(completedLink).toBeInTheDocument();
        fireEvent.click(completedLink);
        const after = await screen.getAllByTestId("todo-item");
        expect(after.length).toEqual(1);
      })
    })
  })
})
