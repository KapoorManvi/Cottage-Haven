DROP TABLE IF EXISTS admins CASCADE;

CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY NOT NULL REFERENCES users(u_id)
);
