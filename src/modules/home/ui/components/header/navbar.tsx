import Logo from "./logo";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import FlipLink from "@/components/flip-link";

const Navbar = () => {
  return (
    <nav>
      <div className="flex items-center gap-5 pb-3 px-4 relative">
        <Logo />
        <div className="hidden lg:flex gap-4">
          <FlipLink href="/work">Work</FlipLink>
          <FlipLink href="/places">Places</FlipLink>
          <FlipLink href="/map">Map</FlipLink>
          <FlipLink href="/journeys">Journeys</FlipLink>
          <FlipLink href="/about">About</FlipLink>
        </div>
        <ThemeSwitch />
      </div>
    </nav>
  );
};

export default Navbar;
