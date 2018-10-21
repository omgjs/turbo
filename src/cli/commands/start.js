const defaultStatsOptions = {
	colors: true,
};
const defaultDevServerOptions = {
	stats: defaultStatsOptions,
};
const defaultServerOptions = {
	port: 3000,
	host: "localhost",
};

function start(userDevServerOptions) {
	process.env.NODE_ENV = "development";

	const options = {
		...defaultDevServerOptions,
		...userDevServerOptions,
	};

	const webpackConfig = require("@omgjs/webpack-config-react"); // eslint-disable-line global-require

	const webpackLib = require("webpack"); // eslint-disable-line global-require
	const WebpackDevServer = require("webpack-dev-server"); // eslint-disable-line global-require

	const { port, host } = { ...defaultServerOptions };
	const server = new WebpackDevServer(webpackLib(webpackConfig), options);

	server.listen(port, host, error => {
		if (error) {
			console.log(error); // eslint-disable-line no-console
		}

		console.log(error); // eslint-disable-line no-console

		console.log(`Webpack serving app on http://${host}:${port}`); // eslint-disable-line no-console
	});
}

module.exports = start;
