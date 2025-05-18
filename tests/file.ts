import { faker } from "@faker-js/faker";

export default async function makeImage() {
  const url = faker.image.avatar();
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return new File([buffer], "image.jpg", {
    type: "image/jpeg",
  });
}
