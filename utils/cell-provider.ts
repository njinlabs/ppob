import Brand from "@app-entities/brand.js";

export const brandPrefixes = {
  AXIS: ["62831", "62832", "62833", "62838"],
  "by.U": ["62851"],
  INDOSAT: ["62814", "62815", "62816", "62855", "62856", "62857", "62858"],
  SMARTFREN: [
    "62881",
    "62882",
    "62883",
    "62884",
    "62885",
    "62886",
    "62887",
    "62888",
    "62889",
  ],
  TRI: ["62895", "62896", "62897", "62898", "62899"],
  TELKOMSEL: [
    "62811",
    "62812",
    "62813",
    "62821",
    "62822",
    "62823",
    "62852",
    "62853",
  ],
  XL: ["62817", "62818", "62819", "62859", "62877", "62878"],
} as const;

export function getBrandByPrefix(phone: string) {
  const provider = Object.keys(brandPrefixes).find((el) =>
    brandPrefixes[el as keyof typeof brandPrefixes].find(
      (item) => item === phone.slice(0, 5)
    )
  );

  return Brand.findOneByOrFail({
    name: provider,
  });
}
