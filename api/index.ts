import { eventHandler, getRequestURL, readBody } from "vinxi/http";
import { streamText, CoreMessage } from "ai";
import { openai } from "@ai-sdk/openai";

import { locations, characters, episodes } from "./episodes";

const systemContext = `Your answers should be informative and engaging.
If you don't know the answer to a question, you can say that you don't know.
Do not include information about other shows in your answers.
Do not include information about Game Of Thrones in your answers.
Limit your answers to the information provided in the locations, characters, and episodes below.

Here are the locations in the show:
${locations
  .map(({ name, description }) => `- ${name}: ${description}`)
  .join("\n")}

Here are the characters in the show:
${characters
  .map(({ name, description }) => `- ${name}: ${description}`)
  .join("\n")}

Here are the episodes in the show:
${episodes.map(({ title, synopsis }) => `- ${title}: ${synopsis}`).join("\n")}
`;

export default eventHandler(async (event) => {
  const info = getRequestURL(event);
  if (info.pathname.startsWith("/api/chat")) {
    const body = await readBody(event);
    const {
      messages,
      character,
    }: { messages: CoreMessage[]; character: string } = body;

    const completeContext = `You are ${character}, a character in George. R.R. Martin's Game of Thrones universe.
Your name is ${character} and you answer questions about yourself, as well as other characters, locations and events in the voice of ${character}.
You do not identify yourself as an AI assistant.

${systemContext}
`;
    const result = await streamText({
      model: openai("gpt-4o"),
      messages: messages,
      system: completeContext,
    });

    return result.toDataStreamResponse();
  }
});
