import "./globals.css";
import { PipelineProvider } from "./components/PipelineContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getMeta } from "./lib/data";

export const metadata = {
  title: "CAL Location & Revenue Dashboard",
  description:
    "Crêpes à Latte: how city rotation relates to revenue, National vs Cafe Lines.",
};

export default async function RootLayout({ children }) {
  const meta = await getMeta();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Antonio:wght@400;600;700&family=Jost:wght@400;500;600;700&family=Abel&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body text-ink bg-paper min-h-screen flex flex-col">
        <PipelineProvider>
          <Header />
          <main className="flex-1 w-full max-w-screen mx-auto px-5 sm:px-8 py-8">
            {children}
          </main>
          <Footer meta={meta} />
        </PipelineProvider>
      </body>
    </html>
  );
}
