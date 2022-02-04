const shouldRequirePacakge = (name: string) => {
  try {
    require.resolve(name)
  } catch (e: unknown) {
    if (e instanceof Error && (e as any).code === 'MODULE_NOT_FOUND') {
      console.warn(
        `[WARN] Package "${name}" is necessary but not importable. Did you forget to install?`
      )
    } else {
      throw e
    }
  }
}

export default ({ hasValidator }: { hasValidator: boolean }): void => {
  if (hasValidator) {
    shouldRequirePacakge('class-validator')
    shouldRequirePacakge('class-transformer')
    shouldRequirePacakge('reflect-metadata')
  }
}
