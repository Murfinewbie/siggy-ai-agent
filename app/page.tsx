"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const [likedMessages, setLikedMessages] = useState<number[]>([]);
  const [dislikedMessages, setDislikedMessages] = useState<number[]>([]);

  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const userInput = input;
    setInput("");

    if (textareaRef.current) textareaRef.current.style.height = "40px";

    setIsTyping(true);

    try {

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role === "siggy" ? "assistant" : m.role,
              content: m.text
            })),
            { role: "user", content: userInput }
          ],
          temperature: 0.9,
          seed: Math.random()
        })
      });

      const data = await res.json();

      setIsTyping(false);

      const siggyMsg = { role: "siggy", text: data.reply };

      setMessages((prev) => [...prev, siggyMsg]);

    } catch {

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        { role: "siggy", text: "Siggy lost connection..." }
      ]);

    }

  };

  const handleInput = (e:any) => {

    setInput(e.target.value);

    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 160;

    textarea.style.height =
      Math.min(textarea.scrollHeight, maxHeight) + "px";

  };

  const handleKeyDown = (e:any) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }

  };

  const copyText = (text:string) => {
    navigator.clipboard.writeText(text);
  };

  const readAloud = (text:string) => {

  const speech = new SpeechSynthesisUtterance(text);

  const voices = window.speechSynthesis.getVoices();

  const femaleVoice =
    voices.find(v => v.name.includes("Female")) ||
    voices.find(v => v.name.includes("Google UK English Female")) ||
    voices[0];

  speech.voice = femaleVoice;

  speech.lang = "en-US";

  // suara
  speech.pitch = 0.8;  
  speech.rate = 1;   
  speech.volume = 1;

  window.speechSynthesis.cancel(); // stop suara 
  window.speechSynthesis.speak(speech);

};

  const shareText = (text:string) => {

    if (navigator.share) {

      navigator.share({
        title: "Siggy AI",
        text
      });

    } else {

      navigator.clipboard.writeText(text);
      alert("Response copied for sharing!");

    }

  };

  const retryResponse = async () => {

    setIsTyping(true);

    try {

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({
              role: m.role === "siggy" ? "assistant" : m.role,
              content: m.text
            }))
          ],
          temperature: 1,
          seed: Math.random()
        })
      });

      const data = await res.json();

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        { role: "siggy", text: data.reply }
      ]);

    } catch {

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        { role: "siggy", text: "Retry failed." }
      ]);

    }

  };

  const toggleLike = (index:number) => {

    if (likedMessages.includes(index)) {

      setLikedMessages(likedMessages.filter(i => i !== index));

    } else {

      setLikedMessages([...likedMessages, index]);
      setDislikedMessages(dislikedMessages.filter(i => i !== index));

    }

  };

  const toggleDislike = (index:number) => {

    if (dislikedMessages.includes(index)) {

      setDislikedMessages(dislikedMessages.filter(i => i !== index));

    } else {

      setDislikedMessages([...dislikedMessages, index]);
      setLikedMessages(likedMessages.filter(i => i !== index));

    }

  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (

    <main
      className="flex min-h-screen text-white"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >

      {/* SIDEBAR */}

      <div
         className="hidden md:block fixed left-0 top-0 h-screen w-[16%] bg-cover bg-center z-40"
        style={{
          backgroundImage: "url('/sidebar.png')"
        }}
      >

        <div className="absolute inset-0 backdrop-blur-[6px] bg-black/30"></div>

        <div className="relative p-15">

          <div className="text-base leading-relaxed whitespace-pre-line text-gray-200">
            {`Hi, I’m Siggy
              Your AI companion 
              for ideas, 
              answers, 
              and conversations.

              Ask anything, 
              explore freely, 
              let curiosity lead the way.

              Let’s start the conversation.`}
            </div>

        </div>

      </div>

      {/* CHAT */}

      <div className="w-full md:ml-[16%] md:w-[84%] flex flex-col relative backdrop-blur-[10px]">

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-10 pb-60 flex flex-col gap-6">

          {messages.map((msg, i) => (

            <div
              key={i}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >

              <div
                className={`flex items-end gap-2 max-w-[520px] ${
                  msg.role === "user"
                    ? "ml-auto justify-end"
                    : "justify-start"
                }`}
              >

                {msg.role === "siggy" && (
                  <img
                    src="/siggy.png"
                    className="w-7 h-7 rounded-full"
                    alt="siggy"
                  />
                )}

                <div
                  className="px-4 py-3 rounded-2xl text-base whitespace-pre-wrap break-words leading-relaxed max-w-full flex flex-col gap-3 shadow-lg"
                  style={{
                    backgroundColor: msg.role === "user" ? "#1f1f1f" : "#02a656",
                    color: msg.role === "user" ? "white" : "black"
                  }}
                >

                  <div>{msg.text}</div>

                  {msg.role === "siggy" && (

                    <div className="flex gap-3 mt-1 opacity-90">

                      <button onClick={() => copyText(msg.text)}>
                        <img src="/icons/copy.png" className="w-8 hover:scale-110"/>
                      </button>

                      {!dislikedMessages.includes(i) && (
                      <button onClick={() => toggleLike(i)}>
                        <img
                          src={
                            likedMessages.includes(i)
                              ? "/icons/liked.png"
                              : "/icons/like.png"
                          }
                          className="w-8 hover:scale-110"
                        />
                      </button>
                      )}

                      {!likedMessages.includes(i) && (
                      <button onClick={() => toggleDislike(i)}>
                        <img
                          src={
                            dislikedMessages.includes(i)
                              ? "/icons/disliked.png"
                              : "/icons/dislike.png"
                          }
                          className="w-8 hover:scale-110"
                        />
                      </button>
                      )}

                      <button onClick={() => shareText(msg.text)}>
                        <img src="/icons/share.png" className="w-8 hover:scale-110"/>
                      </button>

                      <button onClick={retryResponse}>
                        <img src="/icons/retry.png" className="w-8 hover:scale-110"/>
                      </button>

                      <button onClick={() => readAloud(msg.text)}>
                        <img src="/icons/voice.png" className="w-8 hover:scale-110"/>
                      </button>

                    </div>

                  )}

                </div>

              </div>

            </div>

          ))}

          {isTyping && (

            <div className="flex items-start gap-2">

              <img src="/siggy.png" className="w-7 h-7 rounded-full"/>

              <div className="bg-[#02a656] text-black px-4 py-2 rounded-2xl flex gap-1">

                <span className="animate-bounce">.</span>
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>

              </div>

            </div>

          )}

          <div ref={chatEndRef}></div>

        </div>

      </div>

      {/* INPUT */}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] md:w-[60%] md:left-[58%] z-50">

        <div className="bg-gray-900 flex rounded-[30px] p-3 items-end shadow-xl">

          <textarea
            ref={textareaRef}
            className="flex-1 bg-transparent resize-none outline-none text-sm max-h-[160px] px-2 py-2.5"
            value={input}
            rows={1}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
          />

          <button
            onClick={sendMessage}
            className="bg-[#02a656] text-black px-5 py-2 rounded-full text-base"
          >
            Send
          </button>

        </div>

      </div>

    </main>

  );

}