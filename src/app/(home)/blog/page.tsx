import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Journeys",
  description: "Journey photographs and notes by YueYong.",
};

const BlogPage = () => {
  redirect("/journeys");
};

export default BlogPage;
