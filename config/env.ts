const ENV = 'dev';

const getEnvVars = () => {
  if (ENV === 'dev') {
    return require('./dev').default;
  } else {
    return require('./prod').default;
  }
};

export default getEnvVars();
