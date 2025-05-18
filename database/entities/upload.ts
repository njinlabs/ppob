import upload from "@app-modules/upload.js";
import {
  AfterInsert,
  AfterLoad,
  AfterUpdate,
  BeforeRemove,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import Base from "./base.js";
import { Exclude } from "class-transformer";

@Entity()
export default class Upload extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column()
  public name!: string;

  @Column()
  public size!: number;

  @Column()
  public type!: string;

  @Exclude({ toPlainOnly: true })
  public buffer?: Buffer;

  public url?: string;

  @AfterLoad()
  public async loadUrl() {
    this.url = await upload().driver.getUrl(this.id);
  }

  @AfterInsert()
  @AfterUpdate()
  public async saveFile() {
    if (this.buffer) {
      await upload().driver.writeFile(this.id, this.buffer);
    }

    this.loadUrl();
  }

  @BeforeRemove()
  public async removeFile() {
    await upload().driver.deleteFile(this.id);
  }

  public getBuffer() {
    return upload().driver.readFile(this.id);
  }

  public getUrl() {
    return upload().driver.getUrl(this.id);
  }

  public static async makeFromFile(file: File) {
    const upload = Upload.create({
      name: file.name,
      size: file.size,
      type: file.type,
    });
    upload.buffer = Buffer.from(await file.arrayBuffer());

    return upload;
  }
}
