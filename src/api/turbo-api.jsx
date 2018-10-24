import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { createStore } from "redux";
import { connect, Provider } from "react-redux";

function addRoute(path, routes) {
	const mapStateToProps = state => ({
		todos: state.todos,
	});
	const mapDispatchToProps = dispatch => ({
		dispatch,
	});

	const connectedComponent = connect(
		mapStateToProps,
		mapDispatchToProps,
	)(routes[path]);
	return <Route exact key={path} path={path} component={connectedComponent} />;
}

export function initApplication(routes) {
	const initialState = {
		todos: ["lalala"],
	};

	function todoApp(state = initialState) {
		// For now, don't handle any actions
		// and just return the state given to us.
		return state;
	}

	const store = createStore(todoApp);

	ReactDOM.render(
		<Provider store={store}>
			<BrowserRouter>
				<Switch>
					{Object.keys(routes).map(path => addRoute(path, routes))}
				</Switch>
			</BrowserRouter>
		</Provider>,
		document.getElementById("app"),
	);
}
