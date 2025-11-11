import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/cjs/index.js",
        format: "cjs",
        sourcemap: true,
      },
      {
        file: "dist/esm/index.js",
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        tsconfig: "./tsconfig.json",
        exclude: ["**/*.test.ts", "**/*.spec.ts"],
        outDir: "dist/types",
      }),
      terser(),
    ],
    external: [
      "@polkadot/api",
      "@polkadot/api-contract",
      "@polkadot/extension-dapp",
      "@polkadot/keyring",
      "axios",
      "bcryptjs",
      "react",
      "react-dom",
    ],
  },
];
