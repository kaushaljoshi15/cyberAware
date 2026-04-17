import { query } from './db';

let initialized = false;

export async function initCyberDb() {
  if (initialized) return;
  
  await query(`
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
  initialized = true;
}

// Helper methods
export async function getAwarenessScore(email: string) {
  await initCyberDb();
  const res = await query('SELECT score FROM user_awareness_scores WHERE user_email = $1', [email]);
  if (res.rows.length === 0) {
    await query('INSERT INTO user_awareness_scores (user_email, score) VALUES ($1, $2)', [email, 0]);
    return 0;
  }
  return res.rows[0].score;
}

export async function incrementAwarenessScore(email: string, points: number = 10) {
  await initCyberDb();
  const res = await query(
    'UPDATE user_awareness_scores SET score = score + $2, updated_at = CURRENT_TIMESTAMP WHERE user_email = $1 RETURNING score',
    [email, points]
  );
  if (res.rows.length === 0) {
    await query('INSERT INTO user_awareness_scores (user_email, score) VALUES ($1, $2)', [email, points]);
    return points;
  }
  return res.rows[0].score;
}

export async function logAnalysis(email: string, content: string, type: string, classification: string, severity: string, explanation: string, recommendations: string) {
  await initCyberDb();
  await query(
    'INSERT INTO analysis_logs (user_email, content, type, classification, severity, explanation, recommendations) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [email, content, type, classification, severity, explanation, recommendations]
  );
}

export async function getAnalysisHistory(email: string) {
  await initCyberDb();
  const res = await query('SELECT * FROM analysis_logs WHERE user_email = $1 ORDER BY created_at DESC LIMIT 50', [email]);
  return res.rows;
}

export async function logSimulation(email: string, scenarioName: string, success: boolean) {
  await initCyberDb();
  await query(
    'INSERT INTO simulations (user_email, scenario_name, success) VALUES ($1, $2, $3)',
    [email, scenarioName, success]
  );
}
