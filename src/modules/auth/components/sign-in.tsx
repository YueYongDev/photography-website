"use client";

// External dependencies
import { z } from "zod";
import { useState } from "react";
import { signIn } from "@/modules/auth/lib/auth-client";

// Internal dependencies - UI Components
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// Internal dependencies - Hooks
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("Login successful");
          setLoading(false);
          router.push("/dashboard");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setLoading(false);
        },
      }
    );
  };

  return (
    <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="m@example.com"
                      type="email"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
