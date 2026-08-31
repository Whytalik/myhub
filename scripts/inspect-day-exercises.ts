import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import pg from "pg";

async function main() {
  const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const query = `
    SELECT d.id as day_id, d.name as day_name, de.id as de_id, de.order, de.sets, de.notes, e.name as exercise_name, e.id as exercise_id
    FROM "TrainingDay" d
    LEFT JOIN "TrainingDayExercise" de ON d.id = de."dayId"
    LEFT JOIN "Exercise" e ON de."exerciseId" = e.id
    ORDER BY d."order" ASC, de."order" ASC
  `;
  const res = await client.query(query);
  console.log("EXERCISES BY DAY:", JSON.stringify(res.rows, null, 2));

  await client.end();
}

main().catch(console.error);
