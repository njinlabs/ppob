import { UploadDriver } from "@app-types/upload.js";
import { join } from "node:path";

export default class BunUpload implements UploadDriver {
  private path = process.env.BUN_UPLOAD_PATH || "./uploads";

  async writeFile(id: string, buffer: Buffer) {
    const blob = new Blob([buffer]);

    await Bun.write(join(this.path, id), blob);
  }

  async readFile(id: string) {
    const physicFile = Bun.file(join(this.path, id));

    if (!(await physicFile.exists())) {
      throw new Error("File not found");
    }

    return Buffer.from(await physicFile.arrayBuffer());
  }

  async deleteFile(id: string) {
    const physicFile = Bun.file(join(this.path, id));

    if (await physicFile.exists()) {
      await physicFile.delete();
    }
  }

  async getUrl(id: string) {
    return `${
      process.env.BUN_UPLOAD_BASE_URL?.replace(/\/+$/, "") || ""
    }/${id}`;
  }
}
