import uploadConfig from "@app-config/upload.config.js";
import { type UploadDriver } from "@app-types/upload.js";

export class Upload {
  private static instance: Upload;
  public driver!: UploadDriver;

  private constructor(driver: UploadDriver) {
    this.driver = driver;
  }

  public static getInstance() {
    if (!Upload.instance) throw new Error("Upload not booted yet");

    return Upload.instance;
  }

  public static async boot() {
    const driver: UploadDriver = new uploadConfig.drivers[
      process.env.UPLOAD_DRIVER as keyof typeof uploadConfig.drivers
    ]();

    if (driver.onBoot) await driver.onBoot();

    Upload.instance = new Upload(driver);
  }
}

const upload = Upload.getInstance;
export default upload;
