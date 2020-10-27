import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.REACT_APP_FLEEK_API_KEY,
  secretAccessKey: process.env.REACT_APP_FLEEK_API_SECRET,
  endpoint: 'https://storageapi.fleek.co',
  region: 'us-east-1',
  s3ForcePathStyle: true
});

export async function pushToStorage(tokenData) {
  return new Promise (async (resolve, reject) => {
    const Key = tokenData['id'] + ".json"
    const params = {
      Bucket: process.env.REACT_APP_FLEEK_BUCKET,
      Key,
      ContentType: 'application/pdf',
      Body: new Buffer(tokenData, 'base64'),
      ACL: 'public-read'
    };
    const request = await s3.putObject(params);

    let hash = {url: [process.env.REACT_APP_FLEEK_BUCKET,'.storage.fleek.co/',Key].join('')};
      await request.on('httpHeaders', (statusCode, headers) => {
        console.log({statusCode});
        if (statusCode === 200) {
          const ipfsHash = headers['x-fleek-ipfs-hash'];
          // Do stuff with ifps hash....
          const ipfsHashV0 = headers['x-fleek-ipfs-hash-v0'];
          // Do stuff with the short v0 ipfs hash... (appropriate for storing on blockchains)

          hash = {...hash, ipfsHash, ipfsHashV0};

          // Return PDF Url
          resolve(hash);
        } else {
          reject('Issues saving token data')
        }
      }).send();
  })
}
