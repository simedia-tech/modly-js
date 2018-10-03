const babel = require("rollup-plugin-babel");
const fs = require("fs");
const path = require("path");
const rollup = require("rollup").rollup;
const StripWhitespace = require("strip-whitespace");
const UglifyJS = require("uglify-js");

if (!fs.existsSync(path.resolve(__dirname, "../dist"))) {
  fs.mkdirSync(path.resolve(__dirname, "../dist"));
}

const stripWhitespace = new StripWhitespace();

(async () => {
  const bundle = await rollup({
    input: path.resolve(__dirname, "../src/index.js"),
    plugins: [
      babel({
        exclude: "node_modules/**"
      })
    ]
  });
  const { code: rollupCode } = await bundle.generate({ format: "umd", name: "Modly" });
  const { code: strippedCode } = stripWhitespace.strip(rollupCode);
  const { code: uglifiedCode } = UglifyJS.minify(strippedCode);

  fs.writeFileSync(path.resolve(__dirname, "../dist/modly.min.js"), uglifiedCode);
})().catch(console.error)