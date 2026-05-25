export const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing env: ${name}`);
  }

  return value;
};

export const getNumberEnv = (name: string, fallback: number): number => {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number env: ${name}`);
  }

  return parsed;
};
