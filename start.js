// start.js

// Load environment variables from .env
require("dotenv").config();

const { exec } = require("child_process");

const port = process.env.PORT || 3000;
const cmd = `npx next start -p ${port}`;

console.log(`Starting Next.js on port ${port}...`);

const child = exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
