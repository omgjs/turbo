function build() {
	process.env.NODE_ENV = "production";

	const webpack = require("webpack"); // eslint-disable-line global-require
	const webpackConfig = require("@omgjs/webpack-config-react"); // eslint-disable-line global-require

	webpack(webpackConfig, (err, stats) => {
		if (err || stats.hasErrors()) {
			console.debug(err, stats.toString()); // eslint-disable-line no-console
			// Handle errors here
		}
		console.log("Production build success."); // eslint-disable-line no-console
	});
}

module.exports = build;
