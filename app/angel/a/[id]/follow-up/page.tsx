import { redirect } from "next/navigation";

/** Angels are never asked follow-up questions; send legacy links to the report or processing step. */
export default async function AngelFollowUpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/angel/a/${id}`);
}
