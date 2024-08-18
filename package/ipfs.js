import { Web3Storage, File } from "web3.storage";

const storeToIpfs = async (contract, jsonFile) => {
  const client = new Web3Storage({
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDBhYjI2YUUxOGEzM0FBNWMzNzQ0N2YyZDhlNUY3M0VjQTUxNTkyNzIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzYxOTc2OTg5MzEsIm5hbWUiOiJFdGhmb3JBbGwifQ.uVHoUcJ93RAvC0YPyHqUchdjIU7jbiwKcbGtf-HUTqw",
  });

  const abi = JSON.parse(jsonFile)?.abi;
  const bytecode = JSON.parse(jsonFile)?.bytecode;

  const ipfsFile = {
    contract,
    abi,
    bytecode,
  };

  const buffer = Buffer.from(JSON.stringify(ipfsFile));

  const file = new File([buffer], "contract.json");

  const rootCid = await client.put([file]);

  return rootCid;
};

export default storeToIpfs;
