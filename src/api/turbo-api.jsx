import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, withRouter } from "react-router-dom";
import { createStore } from "redux";
import { connect, Provider } from "react-redux";
import { connect as reFetchConnect } from "react-refetch";

/* const csvRefetchConnector = reFetchConnect.defaults({
	handleResponse(response) {
		if (
			response.headers.get("content-length") === "0" ||
			response.status === 204
		) {
			return;
		}

		const csv = response.text();

		if (response.status >= 200 && response.status < 300) {
			return csv.then(
				text =>
					new Promise((resolve, reject) => {
						parse(text, (err, data) => {
							if (err) {
								reject(err);
							}
							resolve(data);
						});
					}),
			);
		}
		return csv.then(cause => Promise.reject(new Error(cause)));
	},
}); */

const plainTextReFetchConnector = reFetchConnect.defaults({
	handleResponse(response) {
		if (
			response.headers.get("content-length") === "0" ||
			response.status === 204
		) {
			return new Promise(resolve => {
				resolve("");
			});
		}

		const plainText = response.text();

		if (response.status >= 200 && response.status < 300) {
			return plainText.then(
				text =>
					new Promise(resolve => {
						resolve(text);
					}),
			);
		}
		return plainText.then(cause => Promise.reject(new Error(cause)));
	},
});

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

function connectToDataSource(Component, data, dataSources) {
	if (!data)
		return {
			component: Component,
			dataSources,
		};
	if (typeof data === "string") {
		const Context = React.createContext();
		const dataKey = "data";
		return {
			component: plainTextReFetchConnector(() => ({ data }))(props => (
				<Context.Provider value={{ [dataKey]: props.data }}>
					<Component {...props} data={{ data: props.data }} />
				</Context.Provider>
			)),
			dataSources: [...dataSources, { context: Context, dataKey }],
		};
	}
	throw new Error(`Type of data parameter (${typeof data}) is not supported`);
}

function withContext(Component, Context, dataKey) {
	return function ConnectedComponent(props) {
		return (
			<Context.Consumer>
				{data => <Component {...props} {...{ [dataKey]: data }} />}
			</Context.Consumer>
		);
	};
}

function connectDataSourcesToChildComponent(component, dataSources) {
	let connectedComponent = component;
	dataSources.forEach(dataSource => {
		connectedComponent = withContext(
			connectedComponent,
			dataSource.context,
			dataSource.dataKey,
		);
	});
	return connectedComponent;
}

function wrapComponentsInParams(templateParams, dataSources) {
	Object.keys(templateParams).forEach(key => {
		if (typeof templateParams[key] === "function") {
			const Component = connectDataSourcesToChildComponent(
				templateParams[key],
				dataSources,
			);
			/* eslint-disable no-param-reassign */
			templateParams[key] = withRouter(connectToRedux(Component));
			/* eslint-enable */
		}
	});
	return templateParams;
}

function composeComplexComponent(route, path, dataSources) {
	const Template = route.template;
	const typeOfTemplate = typeof Template;
	if (Template && typeOfTemplate !== "function") {
		throw new Error(
			`template used in "${path}" path should be correct React ` +
				`component, but it is variable/expression of "${typeOfTemplate}" type`,
		);
	}
	if (Template) {
		const DataConnectedTemplate = connectToDataSource(
			Template,
			route.data,
			dataSources,
		);
		return props => (
			<DataConnectedTemplate.component
				{...props}
				{...wrapComponentsInParams(
					route.templateParams,
					DataConnectedTemplate.dataSources,
				)}
			/> // eslint-disable-line
		);
	}
	return <div>Complex component type is not supported</div>;
}

function createComplexRoute(routes, path, dataSources) {
	const route = routes[path];
	const component = composeComplexComponent(route, path, dataSources || []);
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
