globalThis.fetch = async (input) => {
  const url = new URL(input.toString());
  if (url.hostname === "itunes.apple.com" && url.pathname === "/lookup") {
    return Response.json({
      results: [{
        trackName: "Test Track",
        artistName: "Test Artist",
        trackViewUrl: "https://music.apple.com/us/album/test-track/789?i=456",
      }],
    });
  }

  throw new Error(`Unexpected external metadata request: ${url.href}`);
};
