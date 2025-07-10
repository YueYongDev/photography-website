"use client";

// External dependencies
import { z } from "zod";
import { Suspense, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";

// Internal dependencies - UI Components
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import TiptapEditor from "@/components/tiptap-editor";

// Internal dependencies - Hooks & Types
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postsUpdateSchema } from "@/db/schema/posts";
import { toast } from "sonner";

interface FormSectionProps {
  postId: string;
}

export const FormSection = ({ postId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        <FormSectionSuspense postId={postId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="space-y-6 lg:col-span-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full mt-8" />
        </div>
      </div>
    </div>
  );
};

const FormSectionSuspense = ({ postId }: FormSectionProps) => {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [post] = trpc.posts.getOne.useSuspenseQuery({ postId });

  const update = trpc.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated");
      utils.posts.getMany.invalidate();
      utils.posts.getOne.invalidate({ postId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const remove = trpc.posts.remove.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      utils.posts.getMany.invalidate();
      router.push("/posts");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof postsUpdateSchema>>({
    resolver: zodResolver(postsUpdateSchema),
    defaultValues: {
      ...post,
      tags: post.tags || [],
    },
  });

  // Watch the title and content fields to update slug and reading time
  const title = form.watch("title");
  const content = form.watch("content");

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/&/g, "-and-") // Replace & with 'and'
      .replace(/[^\w\-]+/g, "") // Remove all non-word characters
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  };

  // Calculate reading time from content
  const calculateReadingTime = (content: string): number => {
    // Strip HTML tags if content is HTML
    const text = content.replace(/<\/?[^>]+(>|$)/g, "");

    // Count words (split by spaces and filter out empty strings)
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Average reading speed: 200 words per minute
    const readingSpeed = 200;

    // Calculate reading time and round up to nearest integer
    return Math.max(1, Math.ceil(wordCount / readingSpeed));
  };

  // Update slug when title changes
  useEffect(() => {
    if (title) {
      const slug = generateSlug(title);
      form.setValue("slug", slug);
    }
  }, [title, form]);

  // Update reading time when content changes
  useEffect(() => {
    if (content) {
      const readingTime = calculateReadingTime(content);
      form.setValue("readingTimeMinutes", readingTime);
    }
  }, [content, form]);

  const onSubmit = (data: z.infer<typeof postsUpdateSchema>) => {
    update.mutateAsync(data);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Post details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your post details
              </p>
            </div>

            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={update.isPending}>
                Save
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: postId })}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="space-y-6 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Post title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="resize-none"
                        value={field.value || ""}
                        placeholder="Post description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <TiptapEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags separated by commas"
                        value={field.value?.join(", ") || ""}
                        onChange={(e) => {
                          const tagsString = e.target.value;
                          const tagsArray = tagsString
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag !== "");
                          field.onChange(tagsArray);
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter tags separated by commas (e.g. technology, news,
                      guide)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-muted rounded-xl overflow-hidden p-4">
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="post-url-slug" />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="https://example.com/image.jpg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="readingTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reading Time (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value)
                            )
                          }
                          placeholder="5"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibility</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visibility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
