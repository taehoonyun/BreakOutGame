// socketClient.ts
import { io, Socket } from "socket.io-client";
import OpenAI from "openai";
const userId = localStorage.getItem("userId");
/**
 * Creates and returns a Socket.IO client instance.
 * @param namespace - The namespace URL to connect to (default is "ws://example.com/my-namespace")
 * @returns The Socket.IO client instance.
 */
export  const createSocket = (
  namespace: string = "http://localhost:5000"
): Socket => {
  const socket = io(namespace, {
    reconnectionDelayMax: 10000,
    auth: {
      token: "123",
    },
    query: {
      userId,
    },
  });
  return socket;
};


export class DeepSeekAPI {
  private apiUrl: string = "https://api.deepseek.com/v1/move"; // Replace with actual API endpoint
  private apiKey: string = process.env.REACT_APP_DEEPSEEKAPI || ""; // Replace with your API key

  async getMove(gameState: any): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ gameState }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch move from DeepSeek API");
    }

    return response.json();
  }
}