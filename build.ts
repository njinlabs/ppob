import pkg from "./package.json" with {type: 'json'};

(async () => {
  await Bun.build({
    entrypoints: ["./app.ts"],
    outdir: "./out",
    external: Object.keys(pkg.dependencies),
    target: "node",
    format: "cjs",
    minify: true,
  });

  const packageJson = {
    name: "ppob",
    module: "./app.js",
    scripts: {
      start: "node app.js"
    },
    dependencies: pkg.dependencies,
  };

  await Bun.write("./out/package.json", JSON.stringify(packageJson));
})();
