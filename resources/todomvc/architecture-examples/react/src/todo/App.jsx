import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Footer } from "./components/Footer";

export const App = () => {
    const todos = [
        {
          id: "6a3e2475-dd95-4125-9ca3-614e451169eb",
          title: "Wash Car",
          completed: false,
        },
        {
          id: "d43d436c-0528-496d-b472-212cbba39944",
          title: "Do Dishes",
          completed: true,
        },
    ];

    return (
        <>
            <Header todos={todos}/>
            <Main todos={todos}/>
            <Footer todos={todos}/>
        </>
    )
}