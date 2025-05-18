import { UploadDriver } from "@app-types/upload.js";
import * as fs from "node:fs";
import { join } from "node:path";

export default class NodeUpload implements UploadDriver {
  private path = process.env.NODE_UPLOAD_PATH || "./uploads";

  async onBoot() {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path);
    }
  }

  async writeFile(id: string, buffer: Buffer) {
    fs.writeFileSync(join(this.path, id), buffer);
  }

  async readFile(id: string) {
    const path = join(this.path, id);

    if (!fs.existsSync(path)) {
      throw new Error("File not found");
    }

    return fs.readFileSync(path);
  }

  async deleteFile(id: string) {
    const path = join(this.path, id);

    if (fs.existsSync(path)) {
      await fs.unlinkSync(path);
    }
  }

  async getUrl(id: string) {
    return `${
      process.env.NODE_UPLOAD_BASE_URL?.replace(/\/+$/, "") || ""
    }/${id}`;
  }
}
