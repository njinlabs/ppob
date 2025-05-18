import { TransformDate, transformDate } from "@app-utils/transform-date.js";
import { Exclude, Type } from "class-transformer";
import { DateTime } from "luxon";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import Admin from "./admin.js";
import Base from "./base.js";

@Entity("admin_tokens")
export default class AdminToken extends Base {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ default: null, nullable: true })
  public name!: string;

  @Column()
  @Exclude()
  public hashed!: string;

  @Column({ type: "timestamp", nullable: true, transformer: transformDate })
  @TransformDate()
  public expiredAt!: DateTime;

  @Column()
  public userId!: string;

  @ManyToOne(() => Admin, (user) => user.tokens, { cascade: true })
  @Type(() => Admin)
  public user?: Relation<Admin>;
}
