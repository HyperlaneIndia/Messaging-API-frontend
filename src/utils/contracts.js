import {ethers} from "ethers";
import abiRouter from "./routerABI.json";
import abiMain from "./voteMain.json";

const routerAddress = "0x86D685A6E2f091C238d95319E44e45e48801FBdf"; // network mumbai
const mainAddress = "0x0F8FA0BFF68B80a9715ac797606D3cb424A1F951"; // network sepolia


export const getRouterContract = async(signer) => {
    return new ethers.Contract(routerAddress, abiRouter, signer);
}

export const getMainContract = async(signer) => {
    return new ethers.Contract(mainAddress, abiMain, signer);
}
