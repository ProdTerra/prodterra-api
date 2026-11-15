export class WebAppSettings {
  constructor(readonly url: string) {}

  link(path: string, parameters: Record<string, string> = {}): string {
    const url = new URL(path, this.url);
    for (const [name, value] of Object.entries(parameters)) {
      url.searchParams.set(name, value);
    }
    return url.toString();
  }
}
