# 📚 Study Buddy

A mobile-first AI English learning app for Burmese speakers. Practice conversation, fix your grammar, build your vocabulary and test yourself, all in one place.

**Live demo:** https://stdy-buddy.vercel.app (AI features need an access code)

## Features

- **Chat practice**: talk with an AI partner in English at Beginner or Intermediate level
- **Grammar check**: get a corrected sentence, a list of mistakes, and simple explanations in Burmese or English
- **Vocabulary**: save words and let AI add the part of speech, meaning and example sentences; search, delete and listen to pronunciation
- **Quiz**: meaning and fill-in-the-blank questions built from your saved words
- **Dashboard**: day streak, today's activity, words saved and best quiz score
- **Light and dark mode**, and an English / မြန်မာ interface

## Tech stack

- React, TypeScript, Vite
- Tailwind CSS, DaisyUI
- React Router
- Vercel serverless function
- Gemini API, with OpenRouter free models as a fallback

## How it works

- AI requests go through a serverless function (`/api/gemini`), so API keys stay on the server and never reach the browser.
- The function checks an access code, limits request size and rate, and only then calls the AI.
- If Gemini fails or hits its free limit, the request falls back to OpenRouter.
- Vocabulary, quiz results and streaks are stored in the browser (`localStorage`). There are no accounts and no database.

## About

Built as a practice project to get back into React and TypeScript.
