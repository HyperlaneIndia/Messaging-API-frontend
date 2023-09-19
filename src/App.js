import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import { getMainContract, getRouterContract } from "./utils/contracts";

// Main Function
function App() {
  const [wallet, setWallet] = useState(null); // get wallet interface
  const [provider, setProvider] = useState(null); // get the provider for signer
  const [contract, setContract] = useState("sepolia"); // setting contract instance based on network
  const [proposalId, setProposalId] = useState(null); // setting proposal ID for voting
  const [vote, setVote] = useState(0); // Voting for or against; 0: for, 1: against



  /**
   * Function to connect the wallet
   * When the wallet is connected, the wallet address is set to the state along with provider
   */
  const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!");
    }else{
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (accounts) => {
        setWallet(accounts[0]);
        setProvider(new ethers.BrowserProvider(window.ethereum));
        console.log(provider);
      });}
  };

  /**
   *
   * @returns signer
   * Returns the signer for the provider which will be used to call the metamask to sign transactions
   */

  const getSigner = async () => {
    const signer = await provider.getSigner();
    console.log(signer);
    return signer;
  };

  /**
   * Function to select the contract based on network and call the voting function based on the contract
   */

  const contractCaller = async () => {
    if (provider !== null) {
      let networkId = await provider.getNetwork();
      console.log(networkId.chainId);
      if (contract === "mumbai") {
        console.log(
          "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        );
        if (networkId.chainId !== 80001n) {
          console.log("Chain Change request Initiated");
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x13881" }],
          });
          setProvider(new ethers.BrowserProvider(window.ethereum));
        }
        console.log("Chain changed to mumbai");
        const signer = await getSigner();
        const contractNetwork = await getRouterContract(signer);
        await contractNetwork
          .sendVote(proposalId, vote, { value: ethers.parseEther("0.00001") })
          .then((res) => console.log(res))
          .catch((err) => alert(err));
      } else if (contract === "sepolia") {
        if (networkId.chainId !== 11155111n) {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
          setProvider(new ethers.BrowserProvider(window.ethereum));
        }
        const signer = await getSigner();
        const contractNetwork = await getMainContract(signer);
        await contractNetwork
          .voteProposal(proposalId, vote)
          .then((res) => console.log(res))
          .catch((err) => alert(err));
      }
    } else {
      console.log("NO PROVIDER");
    }
  };

  /**
   * Function to handle the change in the select element for network which will later be used to select the contract
   */

  const handleSelect = async (e) => {
    console.log(e.target.value);
    setContract(e.target.value);
  };

  /**
   * Function to handle the change in the select element for voting, which will later be used to vote for or against
   */
  const handleVote = (e) => {
    console.log(e.target.value);
    setVote(e.target.value);
  };

  return (
    <div classNameName="App">
      <div className="grid  h-screen px-4 py-24 bg-[#183672] sm:px-6 lg:px-8 place-items-center ">
        {wallet ? (
          <div className="h-[600px] ">
            <div className="flex items-center justify-center w-full h-full px-4 py-5 sm:p-6">
              <div className="w-full max-w-sm bg-white shadow-lg rounded-xl">
                <div className="px-4 py-5 sm:p-6">
                  <div className="text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-900"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="mt-5 text-xl font-bold text-gray-900">
                      Wallet connected
                    </p>
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      {wallet}
                    </p>
                  </div>

                  <div className="mt-6 ">
                    <div className="space-y-4 ">
                      <div>
                        <label className="text-sm font-bold text-gray-900"></label>
                        <div className="mt-2">
                          <select
                            onChange={handleSelect}
                            className="block w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                          >
                            <option value="sepolia">Sepolia</option>
                            <option value="mumbai">Mumbai</option>
                          </select>
                        </div>
                      </div>
                      <div className="w-full justify-start items-start flex flex-col">
                        <div className="mt-2 w-full">
                          <input
                            type="text"
                            onChange={(e) => setProposalId(e.target.value)}
                            placeholder="Proposal ID"
                            className="block w-full px-4 py-3 placeholder-gray-500 border -gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm caret-indigo-600"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mt-2">
                          <select
                            onChange={handleVote}
                            value={vote}
                            className="block w-full py-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                          >
                            <option value="0">FOR</option>
                            <option value="1">AGAINST</option>{" "}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end mt-5 space-x-4">
                      <button
                        onClick={contractCaller}
                        type="button"
                        className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-blue-900 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-blue-700"
                      >
                        Sign{" "}
                      </button>{" "}
                    </div>

                    <div className="mt-8 bg-white border border-gray-200 rounded-xl">
                      <div className="p-4">
                        <div className="flex items-center">
                          <img
                            className="object-cover w-auto rounded-lg shrink-0 h-14"
                            src="https://assets-global.website-files.com/5f973c970bea5548ad4287ef/61e70d05f3c7146ab79e66bb_ethereum-eth.svg"
                            alt=""
                          />

                          <div className="flex-1 ml-4">
                            {/* <p className="text-base font-bold text-gray-900">
                              {contract}
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                              {vote}
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500">
                              {proposalId}
                            </p> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-xl mx-auto overflow-hidden bg-white rounded-xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-center">
                <div className="flex-1 items-start justify-center">
                  <p className="text-xl font-bold text-gray-900">
                    Connect your wallet
                  </p>
                  <p className="mt-1 text-base font-medium text-gray-500">
                    Connect your wallet to vote
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-6 sm:mt-16">
                <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-1">
                  <div className="overflow-hidden transition-all duration-200 bg-white border border-gray-900 cursor-pointer rounded-xl hover:bg-gray-50">
                    <div className="px-4 py-5">
                      <img
                        className="w-auto h-8 mx-auto"
                        src="https://landingfoliocom.imgix.net/store/collection/niftyui/images/connect-wallet/1/metamask-logo.png"
                        alt=""
                      />
                      <p className="mt-3 text-sm font-bold text-gray-900">
                        Metamask
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={connectWallet}
                  type="button"
                  className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-gray-900 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
