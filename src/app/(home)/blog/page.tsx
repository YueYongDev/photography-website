import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Journeys",
  description:
    "Blog has moved to Journeys, the long-form stories inside YueYong's photography archive.",
};

const BlogPage = () => {
  redirect("/journeys");
};

export default BlogPage;
