const path = require("path");

// gulp & plugins
const { src, dest, watch, series, parallel } = require("gulp");
const gulpFlatten = require("gulp-flatten");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const include = require("gulp-include");
const minify = require("gulp-minify");
const sass = require("gulp-sass")(require("dart-sass"));
const changed = require("gulp-changed");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");

// browsersync
const browserSync = require("browser-sync").create();

// path configuration
const buildPath = path.resolve("./dist");
const srcPath = path.resolve("./src");
const modulesPath = path.resolve("./node_modules");
const fontPath = path.resolve(`${buildPath}/fonts`);
const indexFile = path.resolve("./index.html");
const htaccessFile = path.resolve("./.htaccess");

// files
const files = {
	assets: {
		fonts: `${srcPath}/assets/fonts/**/*`,
		images: `${srcPath}/assets/images/**/*`,
		video: `${srcPath}/assets/video/**/*`,
	},
	htaccess: htaccessFile,
	html: indexFile,
	themeStyles: `${srcPath}/scss/**/*.scss`,
	themeStyleCompile: `${srcPath}/scss/site.scss`,
	themeScripts: `${srcPath}/js/**/*.js`,
	themeScriptCompile: `${srcPath}/js/site.js`,
	bsIconFont: `${modulesPath}/bootstrap-icons/font/fonts/**`,
	dist: buildPath,
};

// Sass task: compiles the site.scss file into /dist/site.css w/ sourcemap
const styles = () =>
	src(files.themeStyleCompile)
		.pipe(changed(files.dist))
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				includePaths: [
					modulesPath,
					path.join(modulesPath, "node_modules/bootstrap/scss/"),
					path.join(modulesPath, "node_modules/bootstrap-icons/font/"),
				],
			})
		)
		.pipe(sass().on("error", sass.logError))
		.pipe(sass({ outputStyle: "compressed" }))
		.pipe(postcss([autoprefixer(), cssnano()]))
		.pipe(sourcemaps.write("."))
		.pipe(
			rename(path => {
				if (path.extname) {
					if (path.dirname === ".") {
						path.dirname = "";
					}
					path.basename = path.dirname.length
						? `${path.dirname}-${path.basename}`
						: path.basename;
					path.dirname = "";
				}
			})
		)
		.pipe(dest(files.dist))
		.pipe(browserSync.stream());

// JS task: compiles the site.js file into /dist/site.js w/ sourcemap
const scripts = () =>
	src(files.themeScriptCompile)
		.pipe(sourcemaps.init())
		.pipe(
			include({
				includePaths: [path.join(modulesPath, "node_modules")],
			})
		)
		.on("error", console.log)
		.pipe(sourcemaps.write("."))
		.pipe(
			minify({
				ext: {
					min: ".js",
				},
				noSource: true,
			})
		)
		.pipe(dest(files.dist));

// copy fonts into package dist folder
const copyFonts = () =>
	src(`${files.assets.fonts}`, { base: "./" })
		.pipe(gulpFlatten({ includeParents: 5, subPath: 2 }))
		.pipe(dest(files.dist));

// copy images into package image folder
const copyImages = () =>
	src(`${files.assets.images}`, { base: "./" })
		.pipe(gulpFlatten({ includeParents: 5, subPath: 2 }))
		.pipe(dest(buildPath));

// copy video into package video folder
const copyVideos = () =>
	src(`${files.assets.video}`, { base: "./" })
		.pipe(gulpFlatten({ includeParents: 5, subPath: 2 }))
		.pipe(dest(buildPath));

// copy BS Icons font into dist folder
const copyBSIcons = () =>
	src(files.bsIconFont).pipe(gulpFlatten()).pipe(dest(fontPath));

const htmlFiles = () =>
	src(files.html).pipe(changed(files.dist)).pipe(dest(buildPath));

const htaccessCopy = () =>
	src(files.htaccess).pipe(changed(files.dist)).pipe(dest(buildPath));

// watch task for development
const watchTask = () => {
	browserSync.init({
		server: {
			baseDir: `./`,
		},
		browser: "google chrome",
		// proxy: "http://localhost:8888",
		files: [
			{
				fn: function (event, file) {
					console.log("BROWSERSYNC EVENT:", event);
					if (event === "change" || event === "add" || event === "addDir") {
						browserSync.reload();
					}
				},
			},
		],
		reload: true,
		reloadDelay: 500,
		watchEvents: ["add", "change", "addDir"],
		snippetOptions: {
			rule: {
				match: /<\/body>/i,
				fn: function (snippet, match) {
					return snippet + match;
				},
			},
		},
	});

	watch(
		[files.themeStyles, files.themeScripts, files.html],
		series(
			parallel(
				styles,
				scripts,
				copyFonts,
				copyImages,
				copyVideos,
				copyBSIcons,
				htmlFiles,
				htaccessCopy
			)
		)
	).on("change", browserSync.reload);
};

// default build process
exports.default = series(
	parallel(
		styles,
		scripts,
		copyFonts,
		copyImages,
		copyVideos,
		copyBSIcons,
		htmlFiles,
		htaccessCopy
	)
);

// production build process
exports.production = series(
	parallel(
		styles,
		scripts,
		copyFonts,
		copyImages,
		copyVideos,
		copyBSIcons,
		htmlFiles,
		htaccessCopy
	)
);

// watch build process
exports.watch = watchTask;
