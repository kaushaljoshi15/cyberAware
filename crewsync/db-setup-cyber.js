const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_awareness_scores (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) UNIQUE NOT NULL,
      score INTEGER DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS analysis_logs (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      content TEXT NOT NULL,
      type VARCHAR(50) NOT NULL,
      classification VARCHAR(50) NOT NULL,
      severity VARCHAR(20) NOT NULL,
      explanation TEXT,
      recommendations TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS simulations (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255),
      scenario_name VARCHAR(255) NOT NULL,
      success BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Cyber tables created successfully.");
  process.exit(0);
}
setup().catch((e) => {
    console.error(e);
    process.exit(1);
});
