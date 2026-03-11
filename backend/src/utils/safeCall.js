export async function safeCall(fn, modelName) {
  try {
    return await fn();
  } catch (error) {
    console.error(`${modelName} error:`, error.message);
    return `${modelName}: Erreur — ${error.message}`;
  }
}
