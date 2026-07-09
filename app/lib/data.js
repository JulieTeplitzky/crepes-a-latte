import { promises as fs } from "fs";
import path from "path";

// Server-side loaders. Data lives in /public/data and is read at build time
// (static generation). Refresh the site by re-running the generator and
// committing the updated JSON.
const DIR = path.join(process.cwd(), "public", "data");

async function load(name) {
  const raw = await fs.readFile(path.join(DIR, `${name}.json`), "utf8");
  return JSON.parse(raw);
}

export const getMeta = () => load("meta");
export const getShows = () => load("shows");
export const getCities = () => load("cities");
export const getPatterns = () => load("patterns");

export async function getShow(acronym) {
  const shows = await getShows();
  const target = decodeURIComponent(acronym).toUpperCase();
  return shows.find((s) => s.acronym.toUpperCase() === target) || null;
}

export async function getCity(city) {
  const cities = await getCities();
  const target = decodeURIComponent(city).toLowerCase();
  return cities.find((c) => c.city.toLowerCase() === target) || null;
}
