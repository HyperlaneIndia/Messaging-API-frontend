# Messaging Frontend

Hello Developers! In the [previous blog](https://www.notion.so/Messaging-API-820300669e63489d94a17a830841c9b9?pvs=21), since you have built out a contract which enables cross chain messaging using Hyperlane, in this blog we will be building a simple frontend to integrate to the contract that is on a remote chain and is used to cast votes on the main voting contract. For instance, in our [previous blog](https://www.notion.so/Messaging-API-820300669e63489d94a17a830841c9b9?pvs=21), we have used the remote contract i.e. Router contract on Mumbai to cast votes on to our main contract, VoteMain on Sepolia. There we did using Remix IDE, but just like every other contract integration, the integration to a contract that has Hyperlane implemented is also the same except a very few changes. We will see through all of it by building a frontend application that will interact with the Mumbai contract and lets us Vote on Sepolia.

The reference repository is added in the [**end](https://www.notion.so/Messaging-Frontend-990dfd3dfb1d45c492a09342bbf1bd98?pvs=21).**

We will walk through the following in this blog :

- [Repository setup(Replit/Local)](https://www.notion.so/Messaging-Frontend-990dfd3dfb1d45c492a09342bbf1bd98?pvs=21)
- [Connect Wallet](https://www.notion.so/Messaging-Frontend-990dfd3dfb1d45c492a09342bbf1bd98?pvs=21)
- [Contracts](https://www.notion.so/Messaging-Frontend-990dfd3dfb1d45c492a09342bbf1bd98?pvs=21)
- [Additional JSX](https://www.notion.so/Messaging-Frontend-990dfd3dfb1d45c492a09342bbf1bd98?pvs=21)
- [Sign Transaction](https://www.notion.so/Messaging-Frontend-990dfd3dfb1d45c492a09342bbf1bd98?pvs=21)

## Instance Setup:

We have setup a basic react app on [Replit](https://replit.com/@shreyaspadmakir/interchain-messages). You can fork this repository and start working with it. It is a simple create-react-app command implemented application.

Replit Instance : [https://replit.com/@shreyaspadmakir/interchain-messages](https://replit.com/@shreyaspadmakir/interchain-messages)

(If you are using Replit, you can skip till [here](https://www.notion.so/Messaging-Frontend-990dfd3dfb1d45c492a09342bbf1bd98?pvs=21))

So if you don’t want to use the replit then open the terminal in the desired directory for your frontend application and enter the following command (hoping you have npm installed, else install npm and then continue)

```bash
npx create-react-app messaging-api-frontend
```

If you are using through the above command and not the [replit](https://replit.com/@shreyaspadmakir/interchain-messages) instance, then I would recommend to navigate to the `./src` folder and open the `App.js` file. Inside the `App.js` file, in the return section, remove all of the JSX except the div with className as “App”.

![Untitled](Messaging%20Frontend%20990dfd3dfb1d45c492a09342bbf1bd98/Untitled.png)

Now that our application is ready to be set up, lets start building the following components:

- Connect Wallet button : we need a signer to sign the transaction right.
- Input field to take in the Proposal ID
- Select field to select the network they want to vote from. If they choose Sepolia, they will interacting with main contract, if they choose Mumbai they will be interacting with Router contract.
- Select field to select the type of Vote, either a FOR or AGAINST.
- Button to sign the transaction to the contract.

Since we have an idea of what we are building with the components lets get started with the functionality.

## Connect Wallet:

Initially, lets install ethers library using the following command:

```bash
npm i ethers
```

We use ethers library to interact with contracts.

The first step is to get the user to connect his wallet to our webapp/frontend.

So, lets create a button. Inside the div as follows:

```html
<div className="App">
	<button>Connect Wallet</button>
</div>
```

If you wish to see your app changes, for:

Ones using Replit, just press the Run button

Ones using local setup, run the following command:

```bash
npm run start
```

You can see a button in the top middle of the screen.

Lets add some functionality to it so that it pops up a wallet and return the account address as well as the provider. We need the provider as it contains the signer object.

Lets add the following piece of code to our codebase. In the `App.js` :

```jsx
import { useState } from "react";
import { ethers } from "ethers";

function App(){
	const [wallet, setWallet] = useState();
  const [provider, setProvider] = useState();
const connectWallet = () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get metamask!");
    }
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then(async (accounts) => {
        setWallet(accounts[0]);
        setProvider(new ethers.BrowserProvider(window.ethereum));
        console.log(provider);
      });
  };
return(
	<div className="App">
		<button onClick={connectWallet}>Connect Wallet</button>
	</div>
);
}

export default App;
```

Add the code accordingly or just copy paste your `App.js` file with above code.

Here we using useState hook, to set wallet address, and to set the provider.

In the connectWallet function, we are checking for a object destructuring named as ethereum from the window library. Usually EVM wallets are named as ethereum and the most common one, Metamask pops up for the same. If you want to use any other wallet, recommend to use a wallet hook like walletConnect.

Now if we there is an ethereum object or a wallet available, then it pops up whenever a button is clicked and then asks for permission to grant the user details to the webapp. If you press connect, then your webapp will have access to account address as well as the provider.

Once you have added this piece of code, just try to hit the button as you will see a wallet op up and if no wallet exists, then, it will throw and alert as ”Get Metamask!”

And finally lets get the signer object from the provider. Lets write a simple function after connectWallet(). Add this piece of code under connectWallet() function.

```jsx
const getSigner = async () => {
    const signer = await provider.getSigner();
    return signer;
  };
```

This above piece of code will return the signer object which will be needed later.

## Contracts:

One of the three crucial parts of the application are ready, the next part is connecting to contracts.

Inside your `./src` directory, create a folder named `./utils` . Under `./utils` create a 3 files named `contracts.js` , `routerABI.json` , `voteMain.json` .

`contracts.js` file will have the Main contract and Router contract connections.

`routerABI.json` will have the ABI of router contract.

`voteMain.json` will have the ABI of Main contract.

You can find the ABI by copy pasting the [contract](https://github.com/HyperlaneIndia/Messaging-API/tree/main/src) into remix → Compile → Copy ABI and then paste it into respective JSON files. It will usually be an array object.

Now lets deep dive to creating contract connections.

Inside `contracts.js` add the following piece of code:

```jsx
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
```

You can change the addresses as per your deployment addresses.

Now there are 2 functions which take the signer as an argument and return a Contract interface. The ethers.Contract takes in 3 arguments, the address of the contract, ABI of the contract, signer instance. The signer argument will be passed during the function call which we will see down the line.

Now that we have the **provider**, **contracts** ready, lets start putting out the input and select fields and functions to handle them. By end of which we will be left with the most important part, i.e. calling a contract which has implemented Hyperlane.

## Additional JSX:

I will be briefing out this part as its a simple JSX handling part which will be added in `App.js`

The design to adding these elements will be such that, there will be a useState hook that will be used to handle each one individually.

```jsx
import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";

function App(){
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
    return signer;
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
	return(

			<div className="App">
					<button onClick={connectWallet}>
							Connect Wallet
					</button>
					<input
								type="text"
                onChange={(e) => setProposalId(e.target.value)}
                placeholder="Proposal ID"
					/>
					<select onChange={handleVote} value={vote}>
								<option value="0">FOR</option>
                <option value="1">AGAINST</option>
          </select>
					<select onChange={handleSelect}>
									<option value="sepolia">Sepolia</option>
                  <option value="mumbai">Mumbai</option>
          </select>

			</div>

	);
}

export default App;
```

Hence we have added the JSX elements and functions to handle them with respective values being saved using the useState hook. Now lets come to the main part of the application, that is calling the function that implements Hyperlane.

With the network selected, we are storing them into contract variable in our useState hook. Using that we will choose which contract the user is going to use to vote. And the 0 and 1 correspond to For and Against as our contracts accept that as an Enum if you check the contract in the [previous blog](https://www.notion.so/Messaging-API-820300669e63489d94a17a830841c9b9?pvs=21).

## Signing Transaction:

Let us now implement a button that will let us sign the transaction for the voting.

For that we add a button below the select tag and add a onClick function as contractCaller which we will define. We also need to import the getMainContract, getRouterContract functions from `./utils/contracts` . We place this in the starting of the file in the import statements section.

```jsx
import { getMainContract, getRouterContract } from "./utils/contracts";
```

```jsx
<button onClick={contractCaller}>Sign</button>
```

The contractCaller snippet will be placed under the handleVote() function and above return statement and it goes like this:

```jsx
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
          .sendVote(proposalId, vote, { value: ethers.parseEther("0.01"), gasLimit: "3000000" })
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
```

Now what we do is, the most important part. We check if there is a provider available and if it is available we fetch the network ID of the connected network. Based on the contract network selected in the select tags we will redirect to change him to the corresponding networks. Post that, based on the network he is on we fetch the right contract by passing the signer object to either getMainContract, getRouterContract functions. And once we have the right contract instance, we call the particular function which deals with voting, i.e. if the network selected is Sepolia then we will retrieve the Main contract and call the `voteProposal` function with usual parameters. If the selected network is Mumbai then we retrieve the Router contract and call the function to send a vote i.e. `sendVote` with the proposal ID, vote type and **a value parameter of 0.01 ethers as a interchain gas fee**.

You can see that in between we are setting providers as once network changes we fetch the new provider details and set it to provider variable in our useState hook and then retrieve the signer to pass it to the getMainContract or getRouterContract functions based on network.

Hence, with this simple frontend and implementation you can design a webapp that will deal with contracts that have Hyperlane integration to them. As I told in the beginning, the change in building an application from a normal application to that which has implemented Hyperlane is  simple with just adding a value parameter to the function that will call the Main contract via Hyperlane.

Here is a reference to the finished repository with classic CSS added. The functionality however remains same.

[https://github.com/HyperlaneIndia/Messaging-API-frontend](https://github.com/HyperlaneIndia/Messaging-API-frontend)

Happy Buidling!