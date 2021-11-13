\echo 'Delete and recreate neighborhood db?'
\prompt 'Return for yes or control-c to cancel > ' foo

DROP DATABASE neighborhood;
CREATE DATABASE neighborhood;
\connect neighborhood

\i neighborhood-schema.sql

\echo 'Delete and recreate neighborhood_test db?'
\prompt 'Return for yes or control-c to cancel > ' foo

DROP DATABASE neighborhood_test;
CREATE DATABASE neighborhood_test;
\connect neighborhood_test

\i neighborhood-schema.sql
