#!/usr/bin/env node

/**
 * Script to generate manifest.json from template
 * This allows keeping sensitive URLs private while maintaining a public template
 */

import fs from "fs";
import path from "path";
import { config } from "dotenv";
import { fileURLToPath } from "url";

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
config();

// Configuration - hardcoded public info, sensitive data from env
const CONFIG = {
  TARGET_URL:
    process.env.EXTENSION_TARGET_URL ||
    "https://your-company.example.com/staff/",
};

function generateManifest() {
  try {
    // Read template
    const templatePath = path.join(__dirname, "manifest.template.json");
    const template = fs.readFileSync(templatePath, "utf8");

    // Replace placeholders
    const manifest = template.replace(
      "https://your-company.example.com/staff/",
      CONFIG.TARGET_URL
    );

    // Write manifest.json
    const manifestPath = path.join(__dirname, "manifest.json");
    fs.writeFileSync(manifestPath, manifest);

    console.log("✅ manifest.json generated successfully");
    console.log(`📍 Target URL: ${CONFIG.TARGET_URL}`);
  } catch (error) {
    console.error("❌ Error generating manifest:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateManifest();
}

export { generateManifest, CONFIG };
