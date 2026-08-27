import { HydrateClient, trpc } from "@/trpc/server";
import { PhotographSection } from "./photograph-section";
import { SiteShell } from "@/modules/site/ui/site-shell";

type Props = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({ params }: Props) => {
  const id = (await params).id;
  const photo = await trpc.photos.getOne({ id });

  return {
    title: photo?.title || "Photograph",
    description: photo?.description || "Photograph by YueYong.",
  };
};

const page = async ({ params }: Props) => {
  const id = (await params).id;
  void trpc.photos.getOne.prefetch({ id });

  return (
    <SiteShell>
      <HydrateClient>
        <PhotographSection id={id} />
      </HydrateClient>
    </SiteShell>
  );
};

export default page;
