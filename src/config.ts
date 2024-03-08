export type Config = {
  user: string,
  password: string,
  connectString: string,
}

const config: Config = {
  user: '',
  password: '',
  connectString: '',
};

const setConfig = (cfg: Config) => {
  config.connectString = cfg.connectString;
  config.user = cfg.user;
  config.password = cfg.password;
};

export default config;

export {
  setConfig,
};
