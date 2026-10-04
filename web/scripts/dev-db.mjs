// Local Postgres for development (no system install needed). Data lives in .pgdata/.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const databaseDir = new URL("../.pgdata", import.meta.url).pathname;
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "xtvk",
  password: "xtvk",
  port: 54329,
  persistent: true,
});

const fresh = !existsSync(`${databaseDir}/PG_VERSION`);
if (fresh) await pg.initialise();
await pg.start();
await pg.createDatabase("xtvk").catch(() => {}); // already exists
console.log("Postgres ready: postgresql://xtvk:xtvk@localhost:54329/xtvk");

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
