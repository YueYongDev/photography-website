import { BlogPostsList } from "../sections/blog-posts-list";
import ContactCard from "@/modules/home/ui/components/contact-card";
import Footer from "@/modules/home/ui/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const BlogHomeView = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Back to home button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        {/* Page title and introduction */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Blog</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to my blog, where I share my thoughts, experiences, and insights. Whether you{`'`}re a photographer, a traveler, or someone who appreciates the beauty of life, you{`'`}ll find content that interests you here.
          </p>
        </div>
        
        {/* Posts list */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">All Posts</h2>
          </div>
          <BlogPostsList />
        </div>
        
        {/* Contact information */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Stay Connected</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ContactCard title="Instagram" />
            <ContactCard title="GitHub" />
            <ContactCard title="X" />
            <ContactCard
              title="Contact me"
              className="bg-primary hover:bg-primary-hover text-white dark:text-black"
            />
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};