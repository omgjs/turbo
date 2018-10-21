import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import resolve from "rollup-plugin-node-resolve";
import url from "rollup-plugin-url";
import eslint from "rollup-plugin-eslint-bundle";

import pkg from "./package.json";

export default {
	input: "src/api/turbo-api.jsx",
	output: [
		{
			file: pkg.main,
			format: "cjs",
			sourcemap: true,
		},
		{
			file: pkg.module,
			format: "es",
			sourcemap: true,
		},
	],
	external: ["react", "react-dom", "prop-types"],
	plugins: [
		external(),
		postcss({
			modules: true,
		}),
		url(),
		eslint({ fix: true }),
		babel({
			exclude: "node_modules/**",
		}),
		resolve(),
		commonjs(),
	],
};
