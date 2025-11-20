
// A list of regular expressions to extract the video ID from a YouTube URL.
const YOUTUBE_REGEX_LIST = [
  /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
  /https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/,
  /https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  /https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
];

/**
 * Extracts the YouTube video ID from a given URL.
 * @param url The YouTube URL.
 * @returns The video ID or null if not found.
 */
export const extractVideoId = (url: string): string | null => {
  for (const regex of YOUTUBE_REGEX_LIST) {
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
};

const MOCK_TRANSCRIPT = `
00:00 - [Host] What if you could build five AI apps for free, each from a single prompt, without writing a single line of code, hiring developers, or paying for custom software? Today, I'll show you step by step how to create five real AI apps inside Google AI Studio, powered by Gemini 2.5 Flash, also known as Nano Banana, and VEO 3.1 for cinematic video generation. And here's the crazy part.
00:22 - [Host] You'll describe the app in plain English, and Gemini writes all the code for you. The front backend, styling, and even the AI logic. This is no code in its purest form. By the end, you'll not only have five fully functional apps, but you'll also know how to unlock the exact five free prompts to copy, paste, and run on your own. You can even use them in no-code builders like Base44, DeepAgent, Lovable, Bubble, Glide, or Adelo.
00:43 - [Host] No theory, no setup headaches, just real apps built in minutes. So before we dive in, hit like and subscribe for more tutorials and free generator, avatar and mascot variations. Let's start with a fun one. Your brand mascot on autopilot. This app takes one base illustration and
01:05 - [Host] ...generates a ton of variations for you. Different poses, different styles, different emotions. It's perfect for social media, marketing materials, or even just for fun. You just upload your mascot, type a simple prompt, and watch the magic happen.
01:25 - [Host] Next up, an app that I call "Content Catalyst". This one is for all the content creators out there. It takes a simple topic, and generates a full content plan around it. We're talking video scripts, blog post outlines, social media updates, and even email newsletters. It's like having a brainstorming partner that never runs out of ideas.
01:48 - [Guest] That sounds incredibly useful. So, you're saying I could input 'healthy breakfast ideas', and it would generate a whole week's worth of content for different platforms?
02:01 - [Host] Exactly! It analyzes the topic, identifies key sub-themes, and structures the content in a way that's engaging and SEO-friendly. It's a massive time-saver.
02:15 - [Host] The third app is "Code Companion". This is for the developers. Imagine you're stuck on a piece of code. You can paste your code into the app, describe the problem in plain English, and the AI will debug it for you. It will explain the error, suggest a fix, and even optimize the code for better performance.
02:37 - [Host] It supports Python, JavaScript, Java, and a dozen other languages. It's not about replacing developers, it's about making them faster and more efficient. Think of it as the ultimate pair programmer.
02:55 - [Host] App number four is a "Personalized Story Weaver". You input a few characters, a setting, and a basic plot point. The AI then writes a unique short story for you. It's amazing for creating bedtime stories for your kids, or for authors looking for a creative spark to overcome writer's block.
03:18 - [Guest] Wow, so the stories are completely original every time?
03:22 - [Host] Yes, completely original. It understands narrative structure, character development, and pacing. You can even choose the genre - fantasy, sci-fi, mystery, you name it. The possibilities are endless.
03:40 - [Host] And finally, the fifth app, leveraging the new VEO model, is the "Instant Movie Maker". You write a short scene, and the AI generates a cinematic video clip from it. We're talking high-definition, realistic motion, and incredible detail. It's still in the early stages, but it's a glimpse into the future of filmmaking.
04:01 - [Host] So there you have it. Five powerful AI applications you can build and use for free, right now. The prompts for all these apps are linked in the description below. Go ahead, give it a try, and let me know what you create. Thanks for watching!
`;

/**
 * Fetches the transcript for a given YouTube video ID.
 * NOTE: This is a MOCK implementation. In a real-world application,
 * this would require a backend service to bypass CORS restrictions
 * and fetch the transcript from YouTube, as direct client-side
 * fetching is not feasible.
 * @param videoId The ID of the YouTube video.
 * @returns A promise that resolves to the video transcript string.
 */
export const getTranscript = (videoId: string): Promise<string> => {
  console.log(`Fetching mock transcript for video ID: ${videoId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TRANSCRIPT);
    }, 1000); // Simulate network delay
  });
};
