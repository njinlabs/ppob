import pkg from "./package.json" with {type: 'json'}

(async () => {
  await Bun.build({
    entrypoints: ["./app.ts"],
    outdir: "./out",
    external: Object.keys(pkg.dependencies),
    target: "node",
    format: "cjs"
  });
})();
