import { TransformDate, transformDate } from "@app-utils/transform-date.js";
import { instanceToPlain, plainToInstance, Type } from "class-transformer";
import { DateTime } from "luxon";
import {
  BaseEntity,
  CreateDateColumn,
  FindOptionsWhere,
  UpdateDateColumn,
} from "typeorm";

export default class Base extends BaseEntity {
  public static from<T extends object>(
    this: new () => T,
    data: Partial<{
      [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
    }>
  ): T {
    return Object.assign(new this(), data);
  }

  public static async findOneAndAssign<T>(
    this: new () => T,
    where: FindOptionsWhere<T>,
    data: Partial<{
      [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
    }>
  ): Promise<T> {
    return Object.assign(
      await (this as unknown as typeof BaseEntity).findOneByOrFail(where),
      data
    ) as T;
  }

  public assign<T = typeof this>(
    data: Partial<{
      [K in keyof T as T[K] extends (...args: any[]) => any ? never : K]: T[K];
    }>
  ) {
    return Object.assign(this, data);
  }

  public serialize() {
    return instanceToPlain(this);
  }

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    transformer: transformDate,
  })
  @TransformDate()
  public createdAt!: DateTime;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
    transformer: transformDate,
  })
  @TransformDate()
  public updatedAt!: DateTime;
}
