import Home from "pages/Home";
import Page from "pages/Page";
import PageWithParam from "pages/PageWithParam";

import { initApplication } from "../api/turbo-api";

const routes = {
	"/": Home,
	"/page": Page,
	"/page/:param": PageWithParam,
};

initApplication(routes);
