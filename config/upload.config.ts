import BunUpload from "@app-utils/upload-drivers/bun.js";
import NodeUpload from "@app-utils/upload-drivers/node.js";
import { createConfig } from "@app-utils/upload.js";

export default createConfig({
  drivers: {
    bun: BunUpload,
    node: NodeUpload,
  },
});
