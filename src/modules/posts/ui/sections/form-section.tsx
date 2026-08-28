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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownEditorEnhanced from "@/components/markdown-editor-enhanced";
import { SparklesIcon } from "lucide-react";

// Internal dependencies - Hooks & Types
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postsUpdateSchema } from "@/db/schema/posts";
import { toast } from "sonner";
import styles from "@/modules/dashboard/ui/studio.module.css";
import { useStudioLocale } from "@/modules/dashboard/i18n/studio-locale";

interface FormSectionProps {
  postId: string;
}

export const FormSection = ({ postId }: FormSectionProps) => {
  const { copy } = useStudioLocale();
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>{copy.overview.error}</p>}>
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
  const { copy } = useStudioLocale();
  const utils = trpc.useUtils();
  const [post] = trpc.posts.getOne.useSuspenseQuery({ postId });

  // AI生成描述的mutation
  const generateAIDescriptionMutation = trpc.ai.generateContent.useMutation({
    onSuccess: (data) => {
      form.setValue("description", data.content);
      toast.success("AI description generated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI description");
    },
  });

  // AI生成标题的mutation
  const generateAITitleMutation = trpc.ai.generateContent.useMutation({
    onSuccess: (data) => {
      form.setValue("title", data.content);
      toast.success("AI title generated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI title");
    },
  });

  // AI生成标签的mutation
  const generateAITagsMutation = trpc.ai.generateContent.useMutation({
    onSuccess: (data) => {
      // 将生成的标签字符串转换为数组
      const tagsArray = data.content
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
      form.setValue("tags", tagsArray);
      toast.success("AI tags generated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI tags");
    },
  });

  // AI生成slug的mutation
  const generateAISlugMutation = trpc.ai.generateContent.useMutation({
    onSuccess: (data) => {
      // 处理AI生成的slug，确保它是URL友好的
      const slug = data.content
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/&/g, "-and-") // Replace & with 'and'
        .replace(/[^\w\-]+/g, "") // Remove all non-word characters
        .replace(/\-\-+/g, "-") // Replace multiple - with single -
        .replace(/^-+/, "") // Trim - from start of text
        .replace(/-+$/, ""); // Trim - from end of text
      form.setValue("slug", slug);
      toast.success("AI slug generated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate AI slug");
    },
  });

  const update = trpc.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Field note updated");
      utils.posts.getMany.invalidate();
      utils.posts.getOne.invalidate({ postId });
      router.push("/studio/journeys");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const remove = trpc.posts.remove.useMutation({
    onSuccess: () => {
      toast.success("Field note deleted");
      utils.posts.getMany.invalidate();
      router.push("/studio/journeys");
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
  // const _title = form.watch("title");
  const content = form.watch("content");

  // Generate slug from title
  // const _generateSlug = (_text: string) => {
  //   return ""; // This function is not used, so we can return an empty string
  // };

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

  // Generate AI description based on content
  const generateAIDescription = () => {
    const content = form.getValues("content");
    const title = form.getValues("title");
    if (!content && !title) {
      toast.error("Please write some content or title first");
      return;
    }

    generateAIDescriptionMutation.mutate({
      prompt: `Based on the following content and title, generate a concise and attractive description:\n\nTitle: ${title}\n\nContent: ${content}`,
      contentType: "description",
      maxLength: 200,
    });
  };

  // Generate AI title based on content
  const generateAITitle = () => {
    const content = form.getValues("content");
    if (!content) {
      toast.error("Please write some content first");
      return;
    }

    generateAITitleMutation.mutate({
      prompt: `Based on the following content, generate a concise and attractive title:\n\n${content}`,
      contentType: "title",
      maxLength: 100,
    });
  };

  // Generate AI tags based on content
  const generateAITags = () => {
    const content = form.getValues("content");
    const title = form.getValues("title");
    if (!content && !title) {
      toast.error("Please write some content or title first");
      return;
    }

    generateAITagsMutation.mutate({
      prompt: `Based on the following content and title, generate 3-5 relevant tags separated by commas:\n\nTitle: ${title}\n\nContent: ${content}`,
      contentType: "other",
      maxLength: 100,
    });
  };

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
          <div className={styles.editorHeader}>
            <div className={styles.editorHeaderCopy}>
              <h1 className={styles.editorTitle}>{copy.editor.storyDetails}</h1>
              <p className={styles.editorDescription}>
                {copy.editor.storyDescription}
              </p>
            </div>

            <div className={styles.editorActions}>
              <Button
                type="button"
                onClick={generateAIDescription}
                disabled={
                  generateAIDescriptionMutation.isPending ||
                  (!form.getValues("content") && !form.getValues("title"))
                }
                variant="secondary"
                className={styles.editorSecondaryButton}
              >
                {generateAIDescriptionMutation.isPending ? (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4 animate-pulse" />
                    {copy.editor.generating}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    {copy.editor.aiDescription}
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={generateAITitle}
                disabled={
                  generateAITitleMutation.isPending ||
                  (!form.getValues("content") && !form.getValues("title"))
                }
                variant="secondary"
                className={styles.editorSecondaryButton}
              >
                {generateAITitleMutation.isPending ? (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4 animate-pulse" />
                    {copy.editor.generating}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    {copy.editor.aiTitle}
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={generateAITags}
                disabled={
                  generateAITagsMutation.isPending ||
                  (!form.getValues("content") && !form.getValues("title"))
                }
                variant="secondary"
                className={styles.editorSecondaryButton}
              >
                {generateAITagsMutation.isPending ? (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4 animate-pulse" />
                    {copy.editor.generating}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="mr-2 h-4 w-4" />
                    {copy.editor.aiTags}
                  </>
                )}
              </Button>
              <Button
                type="submit"
                className={styles.editorPrimaryButton}
                disabled={update.isPending}
              >
                {update.isPending ? copy.editor.saving : copy.editor.save}
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
                    {copy.editor.delete}
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
                    <FormLabel>{copy.editor.title}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={copy.editor.title} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{copy.editor.slug}</FormLabel>
                    <div className="flex gap-2">
                      <FormControl className="flex-1">
                        <Input {...field} placeholder={copy.editor.slug} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          const title = form.getValues("title");
                          if (title) {
                            // 使用AI生成slug
                            generateAISlugMutation.mutate({
                              prompt: `Based on the following title, generate an English, URL-friendly slug. Only return the slug, nothing else:\n\n${title}`,
                              contentType: "other",
                              maxLength: 100,
                            });
                          } else {
                            toast.error("Please enter a title first");
                          }
                        }}
                        disabled={generateAISlugMutation.isPending}
                      >
                        {generateAISlugMutation.isPending
                          ? copy.editor.generating
                          : copy.editor.generate}
                      </Button>
                    </div>
                    <FormDescription>
                      URL-friendly identifier for this field note
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{copy.editor.description}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="resize-none"
                        value={field.value || ""}
                        placeholder={copy.editor.description}
                      />
                    </FormControl>
                    <FormDescription>
                      A short description of this field note (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{copy.editor.content}</FormLabel>
                    <FormControl>
                      <MarkdownEditorEnhanced
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
                    <FormLabel>{copy.editor.tags}</FormLabel>
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
                      Enter tags separated by commas (e.g. travel, photography,
                      story) or use AI Tags button to generate automatically
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div
                className={`${styles.editorAsideCard} flex flex-col gap-4 p-4`}
              >
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                    <FormLabel>{copy.editor.coverImage}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="https://example.com/image.jpg"
                        />
                      </FormControl>
                      <FormDescription>
                        URL of the cover image for your post (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {`Field notes are public by default. Make your changes above and save when this note is ready to rejoin Journeys.`}
                </p>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
