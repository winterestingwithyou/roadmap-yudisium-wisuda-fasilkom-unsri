import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
) {
  const userAgent = request.headers.get("user-agent");
  const readyOption =
    (userAgent && isbot(userAgent)) || routerContext.isSpaMode
      ? "allReady"
      : "shellReady";

  const stream = await renderToReadableStream(
    <ServerRouter
      context={routerContext}
      url={request.url}
    />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        console.error("Rendering error:", error);
      },
    }
  );

  if (readyOption === "allReady") {
    await stream.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");

  return new Response(stream, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
