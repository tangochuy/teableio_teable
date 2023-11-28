import { createAxios } from '@teable-group/openapi';

export const getAxios = () => {
  const axios = createAxios();
  axios.defaults.baseURL = `http://localhost:${process.env.PORT}/api`;
  return axios;
};

export const axios = getAxios();
