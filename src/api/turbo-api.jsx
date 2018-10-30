import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Switch, Route, withRouter } from "react-router-dom";
import { createStore, compose } from "redux";
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
	console.debug("connectToRedux", { component }); // eslint-disable-line no-console
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

function createSimpleRoute(path, component) {
	console.debug("createSimpleRoute", { path, component }); // eslint-disable-line no-console
	return (
		<Route exact key={path} path={path} component={connectToRedux(component)} />
	);
}

function getReFetchFunction(data) {
	if (typeof data === "string") {
		if (data.endsWith("!raw")) {
			return plainTextReFetchConnector;
		}
		if (data.endsWith("!json")) {
			return reFetchConnect;
		}
		/**
		 * TODO: add more reFetchers formats. Add also fetcher with type "any",
		 * so it guesses format of response trying to convert it all of
		 * known formats (or some of them)
		 */
		return reFetchConnect;
	}
	return reFetchConnect;
}

function constructReFetchDataRequestFunction(props, data) {
	const result = {};
	Object.keys(data).forEach(key => {
		result[key] = data[key](props);
	});
	return result;
}

function connectToDataSource(Component, data, dataSources) {
	console.debug("connectToDataSource", { Component, data, dataSources }); // eslint-disable-line no-console
	if (!data)
		return {
			component: Component,
			dataSources,
		};
	if (typeof data === "string") {
		const Context = React.createContext();
		const dataKey = "data";
		const reFetchFunction = getReFetchFunction(data);
		return {
			component: reFetchFunction(() => ({ data }))(props => (
				<Context.Provider value={{ [dataKey]: props.data }}>
					<Component {...props} />
				</Context.Provider>
			)),
			dataSources: [...dataSources, { context: Context, dataKey: [dataKey] }],
		};
	}
	if (typeof data === "object") {
		const Context = React.createContext();
		const reFetchFunction = getReFetchFunction(data);
		return {
			component: reFetchFunction(props =>
				constructReFetchDataRequestFunction(props, data),
			)(props => {
				// TODO: maybe next requires a bit of optimization
				const contextProperties = {};
				Object.keys(data).forEach(key => {
					contextProperties[key] = props[key];
				});
				return (
					<Context.Provider value={contextProperties}>
						<Component {...props} />
					</Context.Provider>
				);
			}),
			dataSources: [
				...dataSources,
				{ context: Context, dataKey: Object.keys(data) },
			],
		};
	}
	throw new Error(`Type of data parameter (${typeof data}) is not supported`);
}

function withContext(Component, Context, dataKey) {
	console.debug("withContext", { Component, Context, dataKey }); // eslint-disable-line no-console
	return function ConnectedComponent(props) {
		return (
			<Context.Consumer>
				{data => {
					const contextProps = {};
					dataKey.forEach(key => {
						contextProps[key] = data[key];
					});
					return <Component {...props} {...contextProps} />;
				}}
			</Context.Consumer>
		);
	};
}

function connectDataSourcesToChildComponent(component, dataSources) {
	/* eslint-disable no-console */
	console.debug("connectDataSourcesToChildComponent", {
		component,
		dataSources,
	});
	/* eslint-enable */
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
	console.debug("wrapComponentsInParams", { templateParams, dataSources }); // eslint-disable-line no-console
	const paramsWithWrappedComponents = { ...templateParams };
	Object.keys(paramsWithWrappedComponents).forEach(key => {
		if (typeof paramsWithWrappedComponents[key] === "function") {
			paramsWithWrappedComponents[key] = compose(
				connectToRedux,
				withRouter,
				connectDataSourcesToChildComponent,
			)(templateParams[key], dataSources);
			// templateParams[key] = withRouter(connectToRedux(Component));
		}
	});
	return paramsWithWrappedComponents;
}

function composeComplexComponent(path, route, dataSources) {
	console.debug("composeComplexComponent", { path, route, dataSources }); // eslint-disable-line no-console
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
		const paramsWithWrappedComponents = wrapComponentsInParams(
			route.templateParams,
			DataConnectedTemplate.dataSources,
		);
		return props => (
			<DataConnectedTemplate.component
				{...props}
				{...paramsWithWrappedComponents}
			/> // eslint-disable-line
		);
	}
	return <div>Complex component type is not supported</div>;
}

function createComplexRoute(path, route, dataSources) {
	console.debug("createComplexRoute", { path, route, dataSources }); // eslint-disable-line no-console
	const component = composeComplexComponent(path, route, dataSources || []);
	return (
		<Route exact key={path} path={path} component={connectToRedux(component)} /> // eslint-disable-line react/jsx-closing-bracket-location
	);
}

function addRoute(path, route) {
	console.debug("addRoute", { path, route }); // eslint-disable-line no-console
	const routeType = typeof route;
	if (routeType === "function") {
		return createSimpleRoute(path, route);
	}
	if (routeType === "object") {
		return createComplexRoute(path, route);
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
	console.debug("getEnhancers"); // eslint-disable-line no-console
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
	console.debug("initApplication", { routes }); // eslint-disable-line no-console
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
					{Object.keys(routes).map(path => addRoute(path, routes[path]))}
				</Switch>
			</BrowserRouter>
		</Provider>,
		document.getElementById("app"),
	);
}

export function componentWithPropTypes(component, PropTypes) {
	console.debug("componentWithPropTypes", { component, PropTypes }); // eslint-disable-line no-console
	component.propTypes = PropTypes; // eslint-disable-line no-param-reassign
	return component;
}

function DataComponent({ Loading, Rejected, Fulfilled, Unknown, dataKey }) {
	const key = dataKey || "data";
	return props => {
		const data = props[key]; // eslint-disable-line react/destructuring-assignment
		if (data.pending) {
			return <Loading {...props} />;
		}
		if (data.rejected) {
			return <Rejected {...props} />;
		}
		if (data.fulfilled) {
			return <Fulfilled {...props} />;
		}
		return <Unknown {...props} />;
	};
}

export function dataComponentWithPropTypes({
	Loading,
	Rejected,
	Fulfilled,
	Unknown,
	PropTypes,
	dataKey,
}) {
	/* eslint-disable no-console */
	console.debug("dataComponentWithPropTypes", {
		Loading,
		Rejected,
		Fulfilled,
		Unknown,
		PropTypes,
	});
	/* eslint-enable */
	return componentWithPropTypes(
		DataComponent({
			Loading,
			Rejected,
			Fulfilled,
			Unknown,
			dataKey,
		}),
		PropTypes,
	);
}
