export const fetcher = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer abc",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};
