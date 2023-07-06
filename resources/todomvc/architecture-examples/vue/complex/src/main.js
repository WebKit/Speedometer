import { createApp } from "vue";
import App from "../../shared/src/App.vue";
import router from "../../shared/src/router";
import "big-dom-generator/dist/app.css";
import "big-dom-generator/generated.css";

const app = createApp(App);

app.use(router);

app.mount(".todoholder");
