const { OpenAI } = require("openai");
const deepseekAI = async (gameData) => {
  try {
    const openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.REACT_APP_DEEPSEEKAPI, // Replace with your actual API key
    });
    const messages = [
      {
        role: "system",
        content: `You are an AI Breakout player. Move the paddle to hit the ball and break all bricks. 
            The 'bricks' field in the game state indicates which bricks have been hit and are now destroyed. 
            Use this information to predict where the ball is likely to go and move the paddle accordingly.`,
      },
      {
        role: "system",
        content: `Brick logic: for (let i = 0; i < 7; i++) { for (let j = 0; j < 3; j++) { const x = 150 + i * (64 + 10); const y = 100 + j * (32 + 10); brick positions.push({ x, y }); } }`,
      },
      {
        role: "user",
        content: `Here is the game state:\n${JSON.stringify(gameData, null, 2)}\n
        The paddle's initial location is 400.
        The paddle can move **only** between **50 and 400**.
        The ball will continue moving based on its current **velocity and direction**.
        The AI must predict where the ball will land and move the paddle to intercept it.
        **Return ONLY a number (the new paddleX position), with no extra text.**`
      }
    ];
      const completion = await openai.chat.completions.create({
        messages,
        model: "deepseek-chat", // Replace with the correct model name
      });
      return completion?.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = deepseekAI;
