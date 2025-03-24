type NpmPackageResp = {
  downloads: number;
  start: string;
  end: string;
  package: string;
};

export async function getNPMPackageDownloads() {
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/last-year/payload-better-auth`,
    {
      next: { revalidate: 60 },
    }
  );

  const npmStat: NpmPackageResp = await res.json();
  return npmStat;
}
