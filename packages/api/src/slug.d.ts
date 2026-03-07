declare module 'slug' {
  function slug(input: string, options?: { lower?: boolean; replacement?: string; [key: string]: unknown }): string
  export default slug
}
