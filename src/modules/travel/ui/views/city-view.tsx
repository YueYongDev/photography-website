import { CitySection } from "../sections/city-section";

interface Props {
  city: string;
  countryCode: string;
}

export const CityView = ({ city, countryCode }: Props) => {
  return (
    <div className="size-full">
      <CitySection city={city} countryCode={countryCode} />
    </div>
  );
};
