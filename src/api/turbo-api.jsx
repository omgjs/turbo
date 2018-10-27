import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, withRouter } from "react-router-dom";
import { createStore } from "redux";
import { connect, Provider } from "react-redux";

function connectToRedux(component) {
	const mapStateToProps = state => ({
		todos: state.todos,
	});
	const mapDispatchToProps = dispatch => ({
		dispatch,
	});
	return connect(
		mapStateToProps,
		mapDispatchToProps,
	)(component);
}

function createSimpleRoute(routes, path) {
	return (
		<Route
			exact
			key={path}
			path={path}
			component={connectToRedux(routes[path])}
		/> // eslint-disable-line react/jsx-closing-bracket-location
	);
}

function wrapComponentsInParams(templateParams) {
	Object.keys(templateParams).forEach(key => {
		if (typeof templateParams[key] === "function") {
			const Component = templateParams[key];
			templateParams[key] = withRouter(connectToRedux(Component)); // eslint-disable-line no-param-reassign
		}
	});
	return templateParams;
}

function composeComplexComponent(route, path) {
	const Template = route.template;
	const typeOfTemplate = typeof Template;
	if (Template && typeOfTemplate !== "function") {
		throw new Error(
			`template used in "${path}" path should be correct React ` +
				`component, but it is variable/expression of "${typeOfTemplate}" type`,
		);
	}
	if (Template) {
		return props => (
			<Template {...props} {...wrapComponentsInParams(route.templateParams)} />
		);
	}
	return <div>Complex component type is not supported</div>;
}

function createComplexRoute(routes, path) {
	const route = routes[path];
	const component = composeComplexComponent(route, path);
	return (
		<Route exact key={path} path={path} component={connectToRedux(component)} /> // eslint-disable-line react/jsx-closing-bracket-location
	);
}

function addRoute(path, routes) {
	const routeType = typeof routes[path];
	if (routeType === "function") {
		return createSimpleRoute(routes, path);
	}
	if (routeType === "object") {
		return createComplexRoute(routes, path);
	}
	return (
		<Route
			exact
			key={path}
			path={path}
			component={() => <div>Not implemented yet</div>}
		/> // eslint-disable-line react/jsx-closing-bracket-location
	);
}

function getEnhancers() {
	// TODO Try to remove when `react-router-redux` is out of beta, LOCATION_CHANGE should not be fired more than once after hot reloading
	// Prevent recomputing reducers for `replaceReducer`
	/* eslint-disable no-underscore-dangle */
	const composeEnhancers =
		process.env.NODE_ENV !== "production" &&
		typeof window === "object" &&
		window.__REDUX_DEVTOOLS_EXTENSION__ &&
		window.__REDUX_DEVTOOLS_EXTENSION__({ shouldHotReload: false });
	/* eslint-enable */
	return composeEnhancers;
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

	/* eslint-disable no-underscore-dangle */
	const store = createStore(todoApp, getEnhancers());

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

export function componentWithPropTypes(component, propTypes) {
	component.propTypes = propTypes; // eslint-disable-line no-param-reassign
	return component;
}
