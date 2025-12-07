function requireEnvVar(name: string): string {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set.`);
    }
    return value;
}

export const settings = {
    API_URL: requireEnvVar("VITE_API_URL"),
};
