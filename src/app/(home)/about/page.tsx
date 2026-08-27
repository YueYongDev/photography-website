import type { Metadata } from "next";

import { AboutView } from "@/modules/site/ui/about-view";

export const metadata: Metadata = {
  title: "About",
  description: "About YueYong — photographer, traveler, and software engineer.",
};

const AboutPage = () => <AboutView />;

export default AboutPage;
