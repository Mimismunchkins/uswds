const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const discardComments = require("postcss-discard-comments");
const filter = require("gulp-filter");
const { src, dest } = require("gulp");
const postcss = require("gulp-postcss");
const replace = require("gulp-replace");
const rename = require("gulp-rename");
const sass = require("gulp-dart-scss");
const sourcemaps = require("gulp-sourcemaps");
const changed = require("gulp-changed");
const dutil = require("./utils/doc-util");
const pkg = require("../package.json");

const normalizeCssFilter = filter("**/normalize.css", { restore: true });

sass.compiler = require("sass");

module.exports = {
  copyVendorSass() {
    dutil.logMessage("copyVendorSass", "Compiling vendor CSS");

    const source = "./node_modules/normalize.css/normalize.css";
    const destination = "src/stylesheets/lib";

    const stream = src([source])
      .pipe(normalizeCssFilter)
      .pipe(rename("_normalize.scss"))
      .pipe(changed(destination))
      .on("error", (error) => dutil.logError("copyVendorSass", error))
      .pipe(dest(destination));

    return stream;
  },

  sass() {
    dutil.logMessage("sass", "Compiling Sass");
    const pluginsProcess = [discardComments(), autoprefixer()];
    const pluginsMinify = [csso({ forceMediaMerge: false })];

    return src("src/patterns/stylesheets/uswds.scss")
      .pipe(sourcemaps.init({ largeFile: true }))
      .pipe(
        sass({
            outputStyle: "expanded",
          })
          .on("error", () => sass.logError)
      )
      .pipe(postcss(pluginsProcess))
      .pipe(replace(/\buswds @version\b/g, `uswds v${pkg.version}`))
      .pipe(dest("dist/css"))
      .pipe(postcss(pluginsMinify))
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(sourcemaps.write("."))
      .pipe(dest("dist/css"));
  },
};
