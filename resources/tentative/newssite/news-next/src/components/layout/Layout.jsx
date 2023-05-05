import Header from "../header/Header";
import Navigation from "../navigation/Navigation";
import Main from "../main/Main";
import Footer from "../footer/Footer";

export default function Layout({ children }) {
    return (
        <>
            <div className="page">
                <Header />
                <Navigation />
                <Main>
                    {children}
                </Main>
                <Footer />
            </div>
        </>
    );
}
