import * as jobs from "@app-crons/index.js";
import { CronJob } from "cron";

export class Cron {
  private static instance: Cron;
  private jobs: CronJob[] = [];

  private constructor() {
    for (const key in jobs) {
      const { time, process } = jobs[key as keyof typeof jobs]();

      this.jobs.push(new CronJob(time, process));
    }
  }

  public static getInstance() {
    if (!Cron.instance) throw new Error("Cron not booted yet");

    return Cron.instance;
  }

  public static async boot() {
    Cron.instance = new Cron();

    Cron.instance.jobs.forEach((job) => {
      job.start();
    });
  }
}

const cron = Cron.getInstance;
export default cron;
