// Places navigation groups Hong Kong under China. Keep each album's original
// countryCode for photo queries; this mapping must not rewrite source metadata.
export const getPlacesCountryCode = (countryCode: string) => {
  const code = countryCode.trim().toUpperCase();
  return code === "HK" ? "CN" : code;
};

export const getPlacesCountryName = (country: string, countryCode: string) =>
  getPlacesCountryCode(countryCode) === "CN" ? "China" : country;
