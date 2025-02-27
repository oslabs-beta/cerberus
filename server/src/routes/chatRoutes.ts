import express from 'express';
import type { Request, Response } from 'express';
import openai from '../config/openai.js';

const router = express.Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      max_tokens: 100,
    });

    res.json({ reply: response.choices[0].message?.content || '' });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with ChatGPT' });
  }
});


export default router;
