declare const codeLineIdBrand: unique symbol;

export type CodeLineId = string & {
  readonly [codeLineIdBrand]: "CodeLineId";
};

export type CodeLanguage = "cpp" | "pseudocode";

export interface CodeLine {
  readonly id: CodeLineId;
  readonly content: string;
}

export interface CodeListing<Language extends CodeLanguage = CodeLanguage> {
  readonly language: Language;
  readonly lines: readonly CodeLine[];
}

export interface SynchronizedCode {
  readonly cpp: CodeListing<"cpp">;
  readonly pseudocode: CodeListing<"pseudocode">;
}

export function codeLineId(value: string): CodeLineId {
  if (value.trim().length === 0) {
    throw new Error("Code line ID must not be empty");
  }

  return value as CodeLineId;
}
