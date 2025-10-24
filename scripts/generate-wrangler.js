import { writeFileSync } from "fs"
import { execSync } from "child_process"

const projectName = execSync("basename $(git rev-parse --show-toplevel)").toString().trim()

const wranglerConfig = `
name = "${projectName}"
compatibility_date = "2024-09-01"

[build]
command = "npm run build"
cwd = "."

[site]
bucket = ".next"
entry-point = "."

[env.production]
vars = { NODE_ENV = "production" }

[observability]
enabled = true
`.trim()

writeFileSync("wrangler.toml", wranglerConfig)

console.log("✅ wrangler.toml generated successfully")
