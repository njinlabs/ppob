import { hash } from "argon2";
import { Exclude, Type } from "class-transformer";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import AdminToken from "./admin-token.js";
import Base from "./base.js";
import { type ControlAvailable } from "@app-types/acl.js";

@Entity()
export default class Admin extends Base {
  @PrimaryGeneratedColumn("uuid")
  public id!: string;

  @Column()
  public fullname!: string;

  @Column()
  @Exclude()
  public password!: string;

  @Column({
    unique: true,
  })
  public email!: string;

  @Column("json")
  public controls!: ControlAvailable[];

  @Exclude({
    toPlainOnly: true,
  })
  public plainPassword!: string;

  @OneToMany(() => AdminToken, (token) => token.user)
  @Type(() => AdminToken)
  public tokens?: AdminToken[];

  @BeforeInsert()
  @BeforeUpdate()
  public async sanitize() {
    if (this.plainPassword) {
      this.password = await hash(this.plainPassword);
    }
    if (this.email) this.email = this.email.toLowerCase();
  }
}
