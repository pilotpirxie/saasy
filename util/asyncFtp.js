const FtpClient = require('ftp');
const path = require('path');
const uuidv4 = require('uuid/v4');

/**
 * Upload file to FTP server
 *
 * @param sourceFileName
 * @param destinationFileName?
 * @param config {host, port, secure, user, password, destinationDirectory, publicUrl}
 * @return {Promise<any>, {filename: string, url:string}}
 */
module.exports = function uploadFile(sourceFileName, destinationFileName = false, config) {
  return new Promise((resolve, reject) => {

    const ftpClient = new FtpClient();
    const remoteFileName = destinationFileName ? destinationFileName : `${Date.now()}-${uuidv4()}`;
    const fullRemoteFileName = path.extname(remoteFileName.toString()) ? remoteFileName : `${remoteFileName}${path.extname(sourceFileName)}`;

    ftpClient.on('ready', function () {
      ftpClient.cwd(config.destinationDirectory, (err) => {
        if (err) reject(err);
        ftpClient.put(sourceFileName, fullRemoteFileName, (err) => {
          if (err) reject(err);
          ftpClient.end();
          resolve({
            filename: fullRemoteFileName,
            url: path.join(config.publicUrl, fullRemoteFileName)
          });
        });
      });
    });
    ftpClient.connect({...config});
  });
};

//
// (async () => {
//   const obj = await uploadFile('img.jpg', undefined, {
//     host: config.FILE_SERVER.HOST,
//     port: config.FILE_SERVER.PORT,
//     secure: config.FILE_SERVER.SECURE,
//     user: config.FILE_SERVER.USER,
//     password: config.FILE_SERVER.PASS,
//     destinationDirectory: config.FILE_SERVER.REMOTE_DIRECTORY,
//     publicUrl: config.FILE_SERVER.PUBLIC_URL
//   });
//   console.log(obj);
// })();
