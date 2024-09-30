import express from "express";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(express.json());

dotenv.config();


const apiKey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

async function run(guessInput) {
  const chatSession = model.startChat({
    generationConfig,

    history: [
      {
        role: "user",
        parts: [
          {text: "You’re a playful and knowledgeable animal expert who loves engaging in fun guessing games. Your specialty lies in identifying animals based on hints that describe their characteristics, habits, or parts. You're enthusiastic and ready to assist players in correctly guessing the animal names based on the clues provided.\nYour task is to serve as an animal name guesser. I will provide descriptions or hints about an animal, and you will respond with the correct animal name in one word with particular emoji.\nelse respond \"Please input valid information.\"  if a single word is not related to animal or living beings.\n\nKeep in mind that the descriptions can refer to the animal's behavior, physical traits, or any unique aspects, and aim to provide the most accurate and concise animal name as your answer."},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Alright, I'm ready to play! Bring on the clues! 🐾  I'm excited to see if you can stump me! 😉 \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Which animal has trunk in his body?\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Elephant \n"},
        ],
      },
      {
        role: "user",
        parts: [
          {text: "Who founded bulb?\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "Please input valid information. \n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(guessInput);
  const response = result.response;
  return response.text();
}


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// sending post request to the client side 
app.post('https://animal-name-guesser.vercel.app/guess', async (req, res) => {

  try {

    const guessInput = req.body?.guessInput;
    console.log("Incoming /guess request", guessInput);

    if (!guessInput) {
      // sending response as status code 400 with a error message of "Invalid Request Body"
      return res.status(400).json({ error: "Invalid Request Body" });
    }

    const response = await run(guessInput);
    res.json({ response });
  } catch (error) {
    console.error("Error in guess endpoint:", error);
      // sending response as status code 500 with a error message of "Internal Server Error"
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
