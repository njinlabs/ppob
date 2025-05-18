export interface UploadDriver {
  writeFile: (id: string, file: Buffer) => Promise<void>;
  readFile: (id: string) => Promise<Buffer>;
  deleteFile: (id: string) => Promise<void>;
  getUrl: (id: string) => Promise<string>;
  onBoot?: () => Promise<void>;
}
