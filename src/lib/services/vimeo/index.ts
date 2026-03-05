type VimeoVideoMetadata = {
  title: string;
  duration: number;
  thumbnail: string;
  width: number;
  height: number;
};

export async function getVideoMetadata(
  videoId: string
): Promise<VimeoVideoMetadata> {
  const token = process.env.VIMEO_ACCESS_TOKEN;
  if (!token) throw new Error("VIMEO_ACCESS_TOKEN is not set");

  const response = await fetch(
    `https://api.vimeo.com/videos/${videoId}?fields=name,duration,pictures.base_link,width,height`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Vimeo API error: ${response.status} ${response.statusText}`
    );
  }

  const data: {
    name: string;
    duration: number;
    pictures: { base_link: string };
    width: number;
    height: number;
  } = await response.json();

  return {
    title: data.name,
    duration: data.duration,
    thumbnail: data.pictures.base_link,
    width: data.width,
    height: data.height,
  };
}
