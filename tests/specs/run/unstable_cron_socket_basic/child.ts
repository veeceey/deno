Deno.cron("A fun cron 123 - _", "* * * * *", () => {
  console.log("test-cron executed");
});

// wait to ensure cron sock sees both without race conditions
await new Promise((r) => setTimeout(r, 1000));

Deno.cron("Fail cron", "*/5 * * * *", { backoffSchedule: [100] }, () => {
  throw new Error("an error");
});
