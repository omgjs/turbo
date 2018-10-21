Object.defineProperty(exports, "__esModule", { value: true });

function _interopDefault(ex) {
	return ex && typeof ex === "object" && "default" in ex ? ex.default : ex;
}

const React = _interopDefault(require("react"));
const ReactDOM = _interopDefault(require("react-dom"));

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

exports.initApplication = initApplication;
//# sourceMappingURL=turbo-api.js.map
