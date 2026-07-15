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
  // #22 Fix: Exit so process manager can restart cleanly
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err.name, err.message);
  console.error(err);
  // #22 Fix: Uncaught exceptions leave the process in an undefined state — must exit
  process.exit(1);
});
