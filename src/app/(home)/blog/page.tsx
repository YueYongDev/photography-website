import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Journeys",
  description:
    "Blog has moved to Journeys, the hub for standalone visual travel stories.",
};

const BlogPage = () => {
  redirect("/journeys");
};

export default BlogPage;
