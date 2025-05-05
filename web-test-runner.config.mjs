import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: ["src/**/*.test.js", "test/**/*.test.js"], // Where to find test files
  nodeResolve: true, // Allows importing node modules
  plugins: [esbuildPlugin({ js: true, jsx: true })], // Use esbuild for faster processing
  // Optional: Add coverage configuration later if needed
  // coverageConfig: {
  //   report: true,
  //   reportDir: 'coverage',
  //   threshold: {
  //     statements: 85,
  //     branches: 85,
  //     functions: 85,
  //     lines: 85,
  //   },
  // },
};
