import { NODE_ENV_isTest } from '../web_api/NODE_ENV_isDevelopment';

const maintainers: { (): void; }[] = [];

const minutes = NODE_ENV_isTest ? 0.01 : 5; // call every 600 ms when testing
const fiveMinutesInMiliseconds = minutes * 60 * 1000;

setInterval(() => {
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
    throw new Error('Function alredy registered');    
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
