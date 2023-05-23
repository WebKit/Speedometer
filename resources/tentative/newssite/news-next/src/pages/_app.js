import "@/styles/variables.css";
import "@/styles/globals.css";
import "@/styles/icons.css";
import "@/styles/button.css";
import "@/styles/a11y.css";
import "@/styles/layout.css";
import "@/styles/header.css";
import "@/styles/nav.css";
import "@/styles/footer.css";
import "@/styles/navbar.css";
import "@/styles/dialog.css";
import "@/styles/dropdown.css";
import "@/styles/article.css";
import "@/styles/text.css";
import "@/styles/toggle.css";
import "@/styles/toast.css";
import "@/styles/sitemap.css";
import "@/styles/message.css";
import "@/styles/icons-group.css";

import { useEffect, useState } from "react";

function App({ Component, pageProps }) {
    const [render, setRender] = useState(false);
    useEffect(() => setRender(true), []);
    return render ? <Component {...pageProps} /> : null;
}
export default App;
