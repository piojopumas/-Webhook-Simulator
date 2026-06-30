import { WebhookConfig, WebhookLog } from '../types';

const CONFIGS_KEY = 'hotmart_webhook_configs';
const LOGS_KEY = 'hotmart_webhook_logs';

export const getConfigs = (): WebhookConfig[] => {
  const data = localStorage.getItem(CONFIGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveConfig = (config: WebhookConfig) => {
  const configs = getConfigs();
  const index = configs.findIndex(c => c.id === config.id);
  if (index > -1) {
    configs[index] = config;
  } else {
    configs.push(config);
  }
  localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
};

export const deleteConfig = (id: string) => {
  const configs = getConfigs().filter(c => c.id !== id);
  localStorage.setItem(CONFIGS_KEY, JSON.stringify(configs));
};

export const getLogs = (): WebhookLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const addLog = (log: WebhookLog) => {
  const logs = getLogs();
  logs.unshift(log); // Newer logs first
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs.slice(0, 50))); // Keep last 50
};
