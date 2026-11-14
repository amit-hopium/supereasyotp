CREATE TABLE IF NOT EXISTS users(id uuid PRIMARY KEY);
CREATE TABLE IF NOT EXISTS accounts(id uuid PRIMARY KEY,user_id uuid REFERENCES users ON DELETE CASCADE,sub text UNIQUE NOT NULL,email text NOT NULL,token text NOT NULL,status text DEFAULT 'connected',watch_expires bigint);
CREATE TABLE IF NOT EXISTS sessions(id text PRIMARY KEY,user_id uuid REFERENCES users ON DELETE CASCADE,expires timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS refreshes(hash text PRIMARY KEY,session_id text REFERENCES sessions ON DELETE CASCADE,used boolean DEFAULT false);
CREATE TABLE IF NOT EXISTS outbox(id text PRIMARY KEY,account_id uuid REFERENCES accounts ON DELETE CASCADE,history_id text NOT NULL,created timestamptz DEFAULT now());
