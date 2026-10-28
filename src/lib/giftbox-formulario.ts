/** Defense in depth: preview mode must never invoke the real persistence callback. */
export async function guardarFormulario<T>(vistaPrevia: boolean, guardar: () => PromiseLike<T>): Promise<T | null> {
  if (vistaPrevia) return null;
  return await guardar();
}
