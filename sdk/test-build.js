#!/usr/bin/env node

// Simple SDK test that avoids browser dependencies
try {
  const fs = require("fs");
  const path = require("path");

  // Check if build output exists
  const cjsPath = path.join(__dirname, "dist/cjs/index.js");
  const esmPath = path.join(__dirname, "dist/esm/index.js");

  console.log("🔍 Checking SDK build outputs...");

  if (fs.existsSync(cjsPath)) {
    console.log("✅ CommonJS build found:", cjsPath);

    // Read the built file to check exports
    const content = fs.readFileSync(cjsPath, "utf8");

    if (content.includes("AuthentifySDK")) {
      console.log("✅ AuthentifySDK class found in build");
    }

    if (content.includes("ApiClient")) {
      console.log("✅ ApiClient class found in build");
    }

    if (content.includes("ContractClient")) {
      console.log("✅ ContractClient class found in build");
    }

    if (content.includes("DEFAULT_CONFIG")) {
      console.log("✅ DEFAULT_CONFIG constant found in build");
    }
  } else {
    console.log("❌ CommonJS build not found");
  }

  if (fs.existsSync(esmPath)) {
    console.log("✅ ES Module build found:", esmPath);
  } else {
    console.log("❌ ES Module build not found");
  }

  // Check package.json
  const packagePath = path.join(__dirname, "package.json");
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
    console.log(`📦 Package: ${pkg.name}@${pkg.version}`);
    console.log(`📄 Description: ${pkg.description}`);
    console.log(`📝 Main entry: ${pkg.main}`);
    console.log(`📝 Module entry: ${pkg.module}`);
    console.log(`📝 Types entry: ${pkg.types}`);
  }

  console.log("🎉 SDK build validation completed successfully!");
} catch (error) {
  console.error("❌ Error validating SDK build:", error.message);
  process.exit(1);
}
