import { vi } from "vitest";

export function createNextIntlServerMock(messages: Record<string, unknown>) {
  function resolve(namespace: string) {
    const parts = namespace.split(".");
    let node: unknown = messages;
    for (const part of parts) {
      node = (node as Record<string, unknown>)?.[part];
    }
    return node as Record<string, string>;
  }

  return {
    setRequestLocale: vi.fn(),
    getTranslations: vi.fn(async (namespace: string) => {
      const bundle = resolve(namespace);
      return (key: string, values?: Record<string, string | number>) => {
        let text = bundle[key] ?? key;
        if (values) {
          for (const [k, v] of Object.entries(values)) {
            text = text.replace(`{${k}}`, String(v));
          }
        }
        return text;
      };
    }),
  };
}
