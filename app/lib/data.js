import { promises as fs } from "fs";
import path from "path";

// Server-side loaders. Data lives in /public/data and is read at build time
// (static generation). To refresh, re-run scripts/build_pipeline.py and commit.
const DIR = path.join(process.cwd(), "public", "data");
const load = async (name) =>
  JSON.parse(await fs.readFile(path.join(DIR, `${name}.json`), "utf8"));

export const getMeta = () => load("meta");
export const getShows = () => load("shows");
export const getCities = () => load("cities");
export const getPatterns = () => load("patterns");

export async function getShow(slug) {
  const shows = await getShows();
  const s = decodeURIComponent(slug).toLowerCase();
  return shows.find((x) => x.slug === s) || null;
}
export async function getCity(slug) {
  const cities = await getCities();
  const s = decodeURIComponent(slug).toLowerCase();
  return cities.find((x) => x.slug === s) || null;
}
