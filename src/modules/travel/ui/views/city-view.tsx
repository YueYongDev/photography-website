import { CitySection } from "../sections/city-section";

interface Props {
  city: string;
}

export const CityView = ({ city }: Props) => {
  return (
    <div className="size-full">
      <CitySection city={city} />
    </div>
  );
};
