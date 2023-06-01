import "news-site-css/dist/variables.css";
import "news-site-css/dist/global.css";
import "news-site-css/dist/a11y.css";
import "news-site-css/dist/icons.css";
import "news-site-css/dist/text.css";

import { useEffect, useState } from "react";

function App({ Component, pageProps }) {
    const [render, setRender] = useState(false);
    useEffect(() => setRender(true), []);
    return render ? <Component {...pageProps} /> : null;
}
export default App;
