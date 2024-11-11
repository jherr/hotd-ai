import { eventHandler, toWebRequest } from "vinxi/http";

export default eventHandler((event) => {
  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>HOTD Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body class="bg-black text-white">
        <div id="root"></div>
        <script src="./app/client.tsx" type="module"></script>
      </body>
    </html>

  `,
    {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );
});
