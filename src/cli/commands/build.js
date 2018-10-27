function build() {
	process.env.NODE_ENV = "production";

	const webpack = require("webpack"); // eslint-disable-line global-require
	const webpackConfig = require("@omgjs/webpack-config-react"); // eslint-disable-line global-require

	webpack(webpackConfig, (err, stats) => {
		if (err || stats.hasErrors()) {
			if (err) {
				console.error(err.stack || err); // eslint-disable-line no-console
				if (err.details) {
					console.error(err.details); // eslint-disable-line no-console
				}
				return;
			}

			const info = stats.toJson();

			if (stats.hasErrors()) {
				console.error(info.errors); // eslint-disable-line no-console
			}

			// Handle errors here
			console.log("Production build failed."); // eslint-disable-line no-console
		} else {
			if (stats.hasWarnings()) {
				const info = stats.toJson();
				console.warn(info.warnings); // eslint-disable-line no-console
			}
			console.log("Production build success."); // eslint-disable-line no-console
		}
	});
}

module.exports = build;
