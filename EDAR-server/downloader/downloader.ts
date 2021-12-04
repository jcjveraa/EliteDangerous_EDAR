import Downloader from 'nodejs-file-downloader';

const EDDB_API_BASE_URL = 'https://eddb.io/archive/v6/';

export async function downloadEDDB(filename: string, gzip = true) {
  let custom_headers = {};
  if(gzip) {
    custom_headers = {
      'Accept-Encoding': 'gzip'
    }
  }
  const downloader = new Downloader({
    url: EDDB_API_BASE_URL + filename, //If the file name already exists, a new file with the name 200MB1.zip is created.
    directory: './files', //This folder will be created, if it doesn't exist.
    cloneFiles:false, // Overwrite files
    headers: custom_headers,
    fileName: filename + '.gz'
  })
  try {
    await downloader.download();//Downloader.download() returns a promise.

    console.log('Downloaded ' + filename);
  } catch (error) {//IMPORTANT: Handle a possible error. An error is thrown in case of network errors, or status codes of 400 and above.
    //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
    console.error('Download failed', error)
  }


}
