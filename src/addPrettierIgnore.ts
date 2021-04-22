export const addPrettierIgnore = (text: string) =>
  text.replace(/\n([a-z])/g, '\n// prettier-ignore\n$1')
