import { staticFile } from "remotion";

const BACKDROP_EXTENSIONS = ["png", "jpg", "jpeg"] as const;
const backdropResolutionCache = new Map<string, Promise<string>>();

type BackdropExtension = (typeof BACKDROP_EXTENSIONS)[number];

export const getBackdropImageCandidates = (
  projectId: string,
  preferredExtension: BackdropExtension = "png",
) => {
  const orderedExtensions = [
    preferredExtension,
    ...BACKDROP_EXTENSIONS.filter((extension) => extension !== preferredExtension),
  ];

  return orderedExtensions.map((extension) => {
    return `${projectId}/backdrop.${extension}`;
  });
};

const resolveBackdropImageFileUncached = async (
  candidates: string[],
) => {
  for (const candidate of candidates) {
    const response = await fetch(staticFile(candidate), {
      method: "HEAD",
    }).catch(() => {
      return null;
    });

    if (response?.ok) {
      return candidate;
    }
  }

  throw new Error(
    `Failed to resolve backdrop image. Tried: ${candidates.join(", ")}`,
  );
};

export const resolveBackdropImageFile = (candidates: string[]) => {
  const cacheKey = candidates.join("|");
  const cachedResolution = backdropResolutionCache.get(cacheKey);

  if (cachedResolution) {
    return cachedResolution;
  }

  const resolutionPromise = resolveBackdropImageFileUncached(candidates);
  backdropResolutionCache.set(cacheKey, resolutionPromise);
  return resolutionPromise;
};
