import { notFound } from "next/navigation";
import { getCities, getCity, getMeta } from "../../lib/data";
import CityDetailClient from "../../components/CityDetailClient";

export async function generateStaticParams() {
  const cities = await getCities();
  const params = cities.map((c) => ({ slug: c.slug }));
  return process.env.BUILD_SAMPLE ? params.slice(0, 3) : params;
}

export default async function CityPage({ params }) {
  const [city, meta] = await Promise.all([getCity(params.slug), getMeta()]);
  if (!city) notFound();
  return <CityDetailClient city={city} meta={meta} />;
}
