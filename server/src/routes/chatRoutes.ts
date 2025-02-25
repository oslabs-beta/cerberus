import express from 'express';
import openai from '../config/openai';


const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await openai.createCompletion({
      model: 'gpt-3.5-turbo',
      prompt: message,
      max_tokens: 100,
    });
    res.json({ reply: response.data.choices[0].text.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to communicate with ChatGPT' });
  }
});

export default router;
