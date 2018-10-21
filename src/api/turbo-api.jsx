import React from "react";
import ReactDOM from "react-dom";

export function initApplication() {
	const App = () => <div>Hello to dummy initApplication function</div>;

	ReactDOM.render(<App />, document.getElementById("app"));
}
