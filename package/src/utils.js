import { ethers } from "ethers";

export function stringToBytes(input, length) {
  const bytes = ethers.utils.toUtf8Bytes(input);
  return ethers.utils.concat([bytes, new Uint8Array(length - bytes.length)]);
}
