function requireEnvVar(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set.`);
    }
    return value;
}

export const settings = {
    PORT: process.env.PORT || 3000,
    DB_URL: requireEnvVar("DB_URL"),
};
