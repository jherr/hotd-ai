import { eventHandler, getRequestURL, readBody } from "vinxi/http";
import { streamText, tool, convertToCoreMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { locations, characters, episodes } from "./episodes";

export default eventHandler(async (event) => {
  const info = getRequestURL(event);
  if (info.pathname.startsWith("/api/chat")) {
    const body = await readBody(event);
    const { messages, character }: { messages: any; character: string } = body;

    const system = `You are ${character}, a character in George. R.R. Martin's Game of Thrones universe.
Your name is ${character} and you answer questions about yourself, as well as other characters, locations and events in the voice of ${character}.
You do not identify yourself as an AI assistant.

Only use the tools provided to provide information about the characters, locations, and episodes.
To answer a question about a character, location, or episode, only use the tools provided.

Your answers should be informative and engaging.
If you don't know the answer to a question, you can say that you don't know.
Do not include information about other shows in your answers.
Do not include information about Game Of Thrones in your answers.
`;
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: convertToCoreMessages(messages),
      system,
      maxSteps: 5,
      tools: {
        getCharacterInformation: tool({
          description:
            "Get the information about a character in the House of the Dragon TV show.",
          parameters: z.object({
            name: z.string(),
          }),
          execute: async ({ name }) => {
            const character =
              characters.find((character) => character.name.includes(name))
                ?.description ?? "I don't know that character";
            console.log("getCharacterInformation", name, character);
            return character;
          },
        }),
        getCharacters: tool({
          description:
            "Get the list of characters in the House of the Dragon universe.",
          parameters: z.object({}),
          execute:
            (z.object({}),
            async () => {
              console.log("getCharacters");
              return characters;
            }),
        }),
        getEpisodes: tool({
          description:
            "Get the list of episodes in the House of the Dragon TV show.",
          parameters: z.object({}),
          execute:
            (z.object({}),
            async () => {
              console.log("getEpisodes");
              return episodes;
            }),
        }),
        getLocations: tool({
          description:
            "Get the list of locations in the House of the Dragon TV show.",
          parameters: z.object({}),
          execute:
            (z.object({}),
            async () => {
              console.log("getLocations");
              return locations;
            }),
        }),
      },
    });

    return result.toDataStreamResponse();
  }
});
