import { useChat } from "ai/react";
import Markdown from "react-markdown";

const FACE_WIDTH = 100;

export default function CharacterChat({
  character,
  image,
  width,
  height,
  imageTop,
  imageLeft,
}: {
  character: string;
  image: string;
  width: number;
  height: number;
  imageTop: number;
  imageLeft: number;
}) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      character,
    },
  });

  const scale = FACE_WIDTH / width;

  return (
    <>
      <div className="flex gap-2 mt-5">
        <h1 className="text-3xl font-light">
          Chat with <span className="font-bold">{character}</span>
        </h1>
      </div>
      <div className="flex flex-col mx-2 text-xl gap-4 mt-5">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="bg-blue-900 text-white rounded-xl px-4 py-2 max-w-2/3">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="whitespace-pre-wrap flex gap-2 italic">
              <div
                style={{
                  minWidth: FACE_WIDTH,
                }}
              >
                <div
                  className="rounded-3xl"
                  style={{
                    width,
                    height,
                    backgroundImage: `url(${image})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1280px 640px",
                    backgroundPosition: `${-Math.round(
                      imageLeft
                    )}px ${-Math.round(imageTop)}px`,
                    zoom: scale,
                  }}
                />
              </div>
              <div>
                <Markdown>{m.content}</Markdown>
              </div>
            </div>
          )
        )}
        <form onSubmit={handleSubmit} className="mt-5">
          <input
            className="w-full p-2 mb-8 border border-gray-300 rounded shadow-xl text-black"
            value={input}
            placeholder="What's your question?"
            onChange={handleInputChange}
          />
        </form>
      </div>
    </>
  );
}
