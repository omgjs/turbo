import React from "react";
import ReactDOM from "react-dom";

function initApplication() {
	const App = function App() {
		return React.createElement(
			"div",
			null,
			"Hello to dummy initApplication function",
		);
	};

	ReactDOM.render(
		React.createElement(App, null),
		document.getElementById("app"),
	);
}

export { initApplication };
//# sourceMappingURL=turbo-api.es.js.map
