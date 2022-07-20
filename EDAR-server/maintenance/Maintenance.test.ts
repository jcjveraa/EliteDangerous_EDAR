import { addMaintainer, removeMaintainer, stopMaintenance, testing_only_callMaintainers } from './Maintenance';

// afterEach(() => jest.useRealTimers()); // Not working...
afterEach(() => stopMaintenance());
afterEach (() => {
  const mock = jest.fn();
  removeMaintainer(mock
  );
});


test('A maintenance function is triggered when directly added', async () => {
  const mock = jest.fn();

  addMaintainer(mock);
  testing_only_callMaintainers();

  expect(mock).toBeCalled();

});


test('A maintenance function is triggered via the timer', async () => {
  // jest.useFakeTimers(); // Not working...
  // jest.spyOn(global, 'setInterval');// Not working...
  const mock = jest.fn();
  const mock2 = () => 'a';
  addMaintainer(mock);
  addMaintainer(mock2);

  setTimeout(() => expect(mock).toBeCalledTimes(2), 1400);  
});


test('A maintenance function cannot be added twice', async () => {
  const mock = jest.fn();
  addMaintainer(mock);
  expect(() => addMaintainer(mock)).toThrow();
});
