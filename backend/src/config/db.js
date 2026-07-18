const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

// Earlier local setup files used the placeholder USER at PostgreSQL's default
// port. This machine's active PostgreSQL service uses the postgres role on
// 5433. Preserve the configured password while transparently recovering that
// legacy local connection; correctly configured or remote URLs are untouched.
const configuredDatabaseUrl = process.env.DATABASE_URL;
if (configuredDatabaseUrl) {
    try {
        const databaseUrl = new URL(configuredDatabaseUrl);
        const isLegacyLocalTemplate = databaseUrl.hostname === 'localhost'
            && databaseUrl.port === '5432'
            && databaseUrl.username === 'USER';

        if (isLegacyLocalTemplate) {
            databaseUrl.username = process.env.POSTGRES_USER || 'postgres';
            databaseUrl.port = process.env.POSTGRES_PORT || '5433';
            process.env.DATABASE_URL = databaseUrl.toString();
        }
    } catch (error) {
        console.warn('DATABASE_URL could not be parsed. Check backend/.env.');
    }
}

const prisma = new PrismaClient();

module.exports = prisma;
