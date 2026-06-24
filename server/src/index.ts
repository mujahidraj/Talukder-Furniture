import app from './app.js';
import config from './config/index.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n🚀 Talukder Furniture API Server`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Client URL: ${config.clientUrl}`);
  console.log(`   API: http://localhost:${PORT}/api\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', err.name, err.message);
  console.error(err);
  // Optionally, you could exit here with process.exit(1), but to keep the server alive 
  // despite rogue promises we'll just log it for now.
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err.name, err.message);
  console.error(err);
  // Uncaught exceptions usually mean the process is in an undefined state, 
  // so it's generally best practice to restart the server, but for development we'll log it.
});
