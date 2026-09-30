
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from '@google/genai';
import { Task, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScheduleRequest = async (
  prompt: string,
  currentDate: string,
  existingTasks: Task[]
): Promise<{ text: string; tasks: Partial<Task>[] }> => {
  try {
    const context = `
      Current Date: ${currentDate}
      Existing Tasks Count: ${existingTasks.length}
      Available Staff: 李明, 张三, 王五, 赵六
      Services: 安装, 量尺, 维修, 售后
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        System: You are an intelligent assistant for an Engineering Installation Calendar System. 
        Your goal is to help users manage their schedule, analyze conflicts, or create new work orders (tasks).
        Context: ${context}
        
        User Request: ${prompt}

        If the user wants to create a task, extract the details. 
        If the user is asking a question, answer it.
        Return the response in JSON format with a 'message' (conversational response) and 'tasks' (array of extracted task objects if any).
        
        Task Color Logic:
        - Urgent/Overtime -> red
        - Engineering Project (starts with G) -> orange
        - Measurement/Pre-check -> blue
        - Regular/Installation -> green
        - Default -> white
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            tasks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING, description: "Work order number like W001" },
                  plate: { type: Type.STRING, description: "License plate" },
                  staff: { type: Type.STRING },
                  date: { type: Type.STRING, description: "YYYY-MM-DD" },
                  time: { type: Type.STRING, description: "HH:MM-HH:MM" },
                  location: { type: Type.STRING },
                  service: { type: Type.STRING },
                  note: { type: Type.STRING },
                  color: { type: Type.STRING, enum: ['red', 'blue', 'green', 'orange', 'white'] },
                  type: { type: Type.STRING, enum: ['工程单', '常规订单'] }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      text: result.message || "Processed your request.",
      tasks: result.tasks || []
    };
  } catch (error) {
    console.error("AI Analysis failed", error);
    return {
      text: "抱歉，AI助手暂时无法连接。",
      tasks: []
    };
  }
};

export const summarizeChat = async (chatHistory: ChatMessage[]): Promise<string> => {
  try {
    if (chatHistory.length === 0) return "今日暂无聊天记录。";

    const historyText = chatHistory
      .map(msg => `${msg.userName}: ${msg.content}`)
      .join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an AI secretary for an engineering team. 
        Analyze the following chat history and generate a structured "Daily Task Summary".
        
        Chat History:
        ${historyText}

        Output Format:
        ### 📅 今日任务总结
        - [已确认] 任务内容 (负责人)
        - [待确认] 任务内容 (提及人)
        - [重要通知] ...

        Keep it concise and professional.
      `
    });
    
    return response.text || "无法生成总结。";
  } catch (error) {
    console.error("AI Summarization failed", error);
    return "AI总结服务暂时不可用。";
  }
};


export const generateAdminOutput = async (
  action: 'brief' | 'minutes' | 'email' | 'office-summary',
  sourceText: string,
  taskContext: string
): Promise<string> => {
  const instructions: Record<string, string> = {
    brief: 'Create a concise executive brief with priorities, risks, decisions needed, owners and next actions.',
    minutes: 'Turn the notes into professional meeting minutes with decisions, action items, owners and due dates when available.',
    email: 'Draft a concise professional follow-up email with a clear subject line, context, actions and next steps.',
    'office-summary': 'Create an office operations summary grouped by open items, owners, due dates, blockers and recommended next steps.'
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are an AI productivity assistant supporting an Executive Assistant and Office Manager.
        Task: ${instructions[action]}
        Current operational context:
        ${taskContext || 'No task context provided.'}

        Source material:
        ${sourceText || 'Use the operational context to produce a concise sample output.'}

        Keep the response practical, structured, professional, and ready to use in an office environment.
      `
    });

    return response.text || 'No AI output was returned.';
  } catch (error) {
    console.error('AI admin workflow failed', error);
    return 'AI service is unavailable. Add a valid Gemini API key to enable live executive brief, meeting-minutes, email-drafting and office-summary workflows.';
  }
};
