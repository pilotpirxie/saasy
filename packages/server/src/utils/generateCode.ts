export const generateCode = () => Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
