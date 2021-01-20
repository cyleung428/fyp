import createClient from 'ipfs-http-client';

const ipfs = new createClient('https://ipfs.infura.io:5001');
export default ipfs;