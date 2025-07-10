import { HydrateClient, trpc } from "@/trpc/server";
import { PhotographSection } from "./photograph-section";

type Props = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async ({ params }: Props) => {
  const id = (await params).id;
  const photo = await trpc.photos.getOne({ id });

  return {
    title: `${photo.title}`,
    description: `${photo.description}`,
  };
};

const page = async ({ params }: Props) => {
  const id = (await params).id;
  void trpc.photos.getOne.prefetch({ id });

  return (
    <HydrateClient>
      <PhotographSection id={id} />
    </HydrateClient>
  );
};

export default page;
