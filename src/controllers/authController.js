import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User.js';

export const register = async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, credits: 1 }); // give 1 credit on signup
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'supersecretjwt', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, credits: user.credits } });
};

export const login = async (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'supersecretjwt', { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, credits: user.credits } });
};
