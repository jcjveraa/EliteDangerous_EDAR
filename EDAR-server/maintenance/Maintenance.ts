import { NODE_ENV_isTest } from '../web_api/NODE_ENV_isDevelopment';

const maintainers: { (): void; }[] = [];

const runEveryXMinutes = NODE_ENV_isTest ? 0.01 : 5;
const fiveMinutesInMiliseconds = runEveryXMinutes * 60 * 1000;

const maintenanceInterval = setInterval(() => {
  callMaintainers();
}, fiveMinutesInMiliseconds);

function callMaintainers() {
  maintainers.forEach((func) => func());
}

export const testing_only_callMaintainers = callMaintainers;

export function addMaintainer(fn: { (): void; }) {
  const functionAlreadyInArray = maintainers.find ((maintainer) => 
    maintainer.name === fn.name);
  if(functionAlreadyInArray) {
    throw new Error('Function already registered');    
  }
  maintainers.push(fn);
}

export function removeMaintainer(fn: { (): void; }) {
  const index = maintainers.findIndex ((maintainer) => 
    maintainer.name === fn.name);
    
  if(index !== -1) {
    maintainers.splice(index, 1);
  }
}

export function stopMaintenance() {
  maintainers.splice(0, maintainers.length);
  clearInterval(maintenanceInterval);
}
