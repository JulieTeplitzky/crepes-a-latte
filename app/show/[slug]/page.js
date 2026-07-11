import { notFound } from "next/navigation";
import { getShows, getShow, getMeta } from "../../lib/data";
import ShowDetailClient from "../../components/ShowDetailClient";

export async function generateStaticParams() {
  const shows = await getShows();
  const params = shows.map((s) => ({ slug: s.slug }));
  return process.env.BUILD_SAMPLE ? params.slice(0, 3) : params;
}

export default async function ShowPage({ params }) {
  const [show, meta] = await Promise.all([getShow(params.slug), getMeta()]);
  if (!show) notFound();
  return <ShowDetailClient show={show} meta={meta} />;
}
