const defaultStatsOptions = {
	colors: true,
};
const defaultDevServerOptions = {
	port: 3000,
	host: "0.0.0.0",
	compress: true,
	historyApiFallback: true,
	hot: true,
	open: true,
	stats: defaultStatsOptions,
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

	const { port, host } = { ...defaultDevServerOptions };
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
