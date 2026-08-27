import type { Metadata } from "next";

import { AboutView } from "@/modules/site/ui/about-view";

export const metadata: Metadata = {
  title: "About",
  description: "YueYong, software engineer and photographer.",
};

const AboutPage = () => <AboutView />;

export default AboutPage;
