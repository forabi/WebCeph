declare module "langmap" {
  type langDef = {
    nativeName: string;
    englishName: string;
  };
  const langmap: Record<string, langDef | undefined>;
  export = langmap;
}
