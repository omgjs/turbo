function start() {
	process.env.NODE_ENV = "development";

	const serve = require("webpack-serve"); // eslint-disable-line global-require

	const argv = {};
	const webpackConfig = require("@omgjs/webpack-config-react"); // eslint-disable-line global-require

	serve(argv, { config: webpackConfig }).then(server => {
		server.on("listening", ({ options }) => {
			console.log(`Webpack serving application on port ${options.port}`); // eslint-disable-line no-console
		});
	});
}

module.exports = start;
