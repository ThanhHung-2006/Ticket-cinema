import { app } from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log('====================================================');
  console.log(`🎬 Ticket Cinema Backend Server running on port ${config.port}`);
  console.log(`🔗 API Base URL: http://localhost:${config.port}/api`);
  console.log(`🌍 Environment: ${config.env}`);
  console.log('====================================================');
});

export default server;
