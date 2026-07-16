import { spawnSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

for (const script of ["test", "smoke:api"]) {
  const result = spawnSync(npm, ["run", script], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log("\nVerification complete.");
