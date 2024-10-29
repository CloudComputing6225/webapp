import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: '/opt/app/webapp.log' }),
    new WinstonCloudWatch({
      logGroupName: 'csye6225',
      logStreamName: 'webapp',
      awsRegion: 'us-east-1',
    })
  ]
});

export default logger;