const mRes = require("../module/commonResponse");
const { OpenAI } = require("openai");
module.exports.openAI = async (req, res) => {
  try {
    const openai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey: process.env.REACT_APP_DEEPSEEKAPI, // Replace with your actual API key
    });

    const { gameData, messages } = req.body.params;
    const completion = await openai.chat.completions.create({
      messages,
      model: "deepseek-chat", // Replace with the correct model name
    });

    mRes.sendJSON(res, 200, {
      result: true,
      data: { response: completion.choices[0].messages.content },
    });
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};
