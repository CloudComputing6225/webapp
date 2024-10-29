import SDC from 'statsd-client';

const sdc = new SDC({
  host: 'localhost',
  port: 8125,
  prefix: 'csye6225.webapp.'
});

export default sdc;