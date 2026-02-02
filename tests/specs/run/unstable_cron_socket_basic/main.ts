import { join } from "@std/path";

const socketPath = join(Deno.makeTempDirSync(), "test.sock");

await using _child = new Deno.Command(Deno.execPath(), {
  env: {
    DENO_UNSTABLE_CRON_SOCK: `unix:${socketPath}`,
  },
  args: ["run", "-A", "--unstable-cron", "child.ts"],
  stdin: "null",
  stdout: "inherit",
  stderr: "inherit",
}).spawn();

while (true) {
  try {
    Deno.statSync(socketPath);
    break;
  } catch {}
}

const client = Deno.createHttpClient({
  proxy: {
    transport: "unix",
    path: socketPath,
  },
});

console.log(await fetch("http://cron/crons", { client }).then((r) => r.json()));
console.log(
  await fetch("http://cron/crons/does-not-exist", {
    method: "POST",
    client,
  }).then((r) => r.status),
);
console.log(
  await fetch("http://cron/crons/A fun cron 123 - _", {
    method: "POST",
    client,
  }).then((r) => r.status),
);
console.log(
  await fetch("http://cron/crons/Fail cron", {
    method: "POST",
    client,
  }).then((r) => r.status),
);
