import authConfig from "@app-config/auth.config.js";
import { createId } from "@paralleldrive/cuid2";
import { hash, verify } from "argon2";
import { DateTime } from "luxon";

export class Auth {
  private static instance: Auth;
  private guards!: typeof authConfig.guards;

  private constructor() {
    this.guards = authConfig.guards;
  }

  public static getInstance() {
    if (!Auth.instance) throw new Error("Auth not booted yet");

    return Auth.instance;
  }

  public static boot() {
    Auth.instance = new Auth();
  }

  public use(guard: keyof typeof this.guards = authConfig.defaultGuard) {
    return {
      generate: this.generate(guard),
      validate: this.validate(guard),
    };
  }

  private generate(guard: keyof typeof this.guards) {
    const guardUsed = this.guards[guard];

    return async (
      user: InstanceType<(typeof guardUsed)["user"]>,
      name: string = "",
      expiredAt?: DateTime
    ) => {
      const plainToken = createId();

      const token = new guardUsed.token();
      token.name = name;
      if (expiredAt) token.expiredAt = expiredAt;
      token.hashed = await hash(plainToken);
      token.user = user;

      await token.save();

      return `${token.id}_${plainToken}`;
    };
  }

  private validate(guard: keyof typeof this.guards) {
    const guardUsed = this.guards[guard];

    return async (
      plainToken: string
    ): Promise<InstanceType<(typeof guardUsed)["token"]>> => {
      const [id, hashed = ""] = plainToken.split("_");

      const token = await guardUsed.token.findOneOrFail<
        InstanceType<(typeof guardUsed)["token"]>
      >({
        where: { id: Number(id) },
        relations: {
          user: true,
        },
      });
      await token.user!.reload();

      if (!(await verify(token.hashed, hashed))) {
        throw new Error("Token invalid");
      }

      return token;
    };
  }
}

const auth = Auth.getInstance;
export default auth;
