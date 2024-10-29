import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new WinstonCloudWatch({
      logGroupName: 'csye6225-webapp-logs',
      logStreamName: `webapp-${new Date().toISOString()}`,
      awsRegion: 'us-east-1',
    })
  ]
});

export default logger;