import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/SharedWalletERC20.json";
import tokenDM from "./contracts/IERC20.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isWalletOwner, setIsWalletOwner] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", walletName: "", newWalletOwner:"" });
  const [walletOwnerReply, setWalletOwnerReply] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [currentWalletName, setCurrentWalletName] = useState(null);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [error, setError] = useState(null);

  const contractAddress = '0xE8D54a49f21E0536D219A4774A1A513175d8Ffba';
  const tokenDMAddress = '0x9FF5006291842eBbfD13c53E3f7BE7378cD5B7eD';
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setIsWalletConnected(true);
        setCurrentAddress(account);
        getWalletOwnerHandler();
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our shared wallet.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getWalletName = async () => {
    try {
      if (window.ethereum) {
        console.log("getting wallet name")
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);
  
        let strWalletName = await walletContract.walletName({ gasLimit: 5000000 });
        strWalletName = utils.parseBytes32String(strWalletName);
        setCurrentWalletName(strWalletName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const setWalletNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await walletContract.setWalletName(utils.formatBytes32String(inputValue.newWalletOwner),{ gasLimit: 5000000 });
        console.log("Setting Wallet Name ==> " + inputValue.newWalletOwner);
        await txn.wait();
        console.log("Wallet Name Changed", txn.hash);
        await getWalletName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const setNewWalletOwnerHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await walletContract.addWalletOwner(inputValue.newWalletOwner,{ gasLimit: 5000000 });
        console.log("Setting Wallet Name ==> " + inputValue.newWalletOwner);
        await txn.wait();
        console.log("Wallet owner Added");

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getWalletOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log("signer.address ==> " + signer.address);
        let owner = await walletContract.chkWalletOwner({ gasLimit: 5000000 });
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("owner ==> " + owner);
        if (owner === true)
        {
          console.log("owner is true");
          setWalletOwnerReply(account + " is wallet owner");
          setIsWalletOwner(true);
        }
        else
        {
          console.log("owner is false");
          setWalletOwnerReply(account + " is not wallet owner");
        }

        
          
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const walletBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        let balance = await walletContract.getWalletBalance({ gasLimit: 5000000 });
        setWalletBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const approveTokenHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(tokenDMAddress, tokenDM.abi, signer);

        const txn = await tokenContract.approve(contractAddress,ethers.utils.parseEther(inputValue.deposit));
        console.log("Approving Draf Meme...");
        await txn.wait();
        console.log("Approved Draf Meme...done", txn.hash);

        walletBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await walletContract.depositMoney(ethers.utils.parseEther(inputValue.deposit));
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        walletBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const walletContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await walletContract.withDrawMoney(ethers.utils.parseEther(inputValue.withdraw),{ gasLimit: 5000000 });
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        walletBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our shared wallet.");
      }
    } catch (error) {
      console.log(error)
    }
  }



  useEffect(() => {
    checkIfWalletIsConnected();
    getWalletName();
    getWalletOwnerHandler();
    walletBalanceHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected, walletOwnerReply,walletBalance,currentAddress])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Draf Meme Coin Shared Wallet</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentWalletName === "" && isWalletOwner ?
            <p>"Setup the name of your Draf Meme Coin shared wallet." </p> :
            <p className="text-3xl font-bold">{currentWalletName}</p>
          }
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 DM"
              value={inputValue.deposit}
            />
            <button
              className="btn-purple"
              onClick={approveTokenHandler}>Approve Draf Meme</button>
            <button
              className="btn-purple"
              onClick={deposityMoneyHandler}>Deposit Draf Meme</button>
          </form>
        </div>
        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 DM"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple"
              onClick={withDrawMoneyHandler}>
              Withdraw Draf Meme
            </button>
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Wallet Balance: </span>{walletBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold"></span>{walletOwnerReply}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{currentAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isWalletOwner && (
          <section className="bank-owner-section">
            <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Shared Wallet Admin Panel</h2>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="walletName"
                  placeholder="Enter a Name for You Shared Wallet"
                  value={inputValue.walletName}
                />
                <button
                  className="btn-grey"
                  onClick={setWalletNameHandler}>
                  Set Shared Wallet Name
                </button>
              </form>
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="newWalletOwner"
                  placeholder="Enter address of new Wallet Owner"
                  value={inputValue.newWalletOwner}
                />
                <button
                  className="btn-grey"
                  onClick={setNewWalletOwnerHandler}>
                  Add Wallet Owner
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;