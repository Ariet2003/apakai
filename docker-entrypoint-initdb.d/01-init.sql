--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Debian 15.12-1.pgdg120+1)
-- Dumped by pg_dump version 15.12 (Debian 15.12-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Создаем расширения, если нужны
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Очищаем схему
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Устанавливаем права
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Создаем начальные настройки для авторизации
-- login: admin
-- password: admin123
INSERT INTO "Settings" ("id", "key", "value", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'admin_login', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'admin_password', 'admin123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

--
-- PostgreSQL database dump complete
--

