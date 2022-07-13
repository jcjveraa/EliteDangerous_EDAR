import https from 'https';
import http from 'http';
import {useHttps, modifyOptionsForTesting, extractDataFromMessage, httpModuleToUse} from './OAuth';

export function httpRequestSender<T>(options: https.RequestOptions, dataToSend?: string): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!useHttps) {
      modifyOptionsForTesting(options);
    }

    const callback = async(res: http.IncomingMessage) => {
      res.on('data', dataBuffer => {
        const receivedData = extractDataFromMessage(res, dataBuffer);
        const parsedData = JSON.parse(receivedData);
        resolve(parsedData);
      });
    };

    // const httpModuleToUse = httpModuleToUse;
    const req = httpModuleToUse.request(options, callback);

    req.on('error', error => {
      console.error(error);
      reject('Some error happened...' + error as string);
    });

    if (dataToSend !== undefined) {
      req.write(dataToSend);
    }

    req.end();
  });
}
