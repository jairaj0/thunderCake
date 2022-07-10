import { abi as Token_abi } from "./Abi/abi.js";
const Contract_address = "0xce4A4A15FcCD532eAd67BE3ECf7e6122c61D06bb";
const dead = "0x000000000000000000000000000000000000dead";

const connect = document.querySelector(".connect");
const disconnect = document.querySelector(".disconnect");
const showPrice = document.querySelector("#price");
const claimbtn = document.querySelector(".claimbtn");

const EvmChains = window.evmChains;
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
let web3Modal;
let provider;
let selectedAccount;
let TokenPrice;
let ThoreumPrice;
let PanPrice;
let userAddress;

const api =
  "https://api.pancakeswap.info/api/v2/tokens/0xce4A4A15FcCD532eAd67BE3ECf7e6122c61D06bb";
const Tapi =
  "https://api.pancakeswap.info/api/v2/tokens/0x580dE58c1BD593A43DaDcF0A739d504621817c05";
const Papi =
  "https://api.pancakeswap.info/api/v2/tokens/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";

const apiData = async (path) => {
  let data = await fetch(path);
  data = await data.json();
  return data;
};

const Price = async (path) => {
  let data = await apiData(path);
  let price = data.data.price;
  price = parseFloat(price).toFixed(8);
  return price;
};

function init() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/",
        },
        network: "binance",
      },
    },
  };

  web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: false,
    providerOptions,
  });
}

async function fetchAccountData() {
  const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  console.log(chainId);
  const chainData = await EvmChains.getChain(chainId);
  console.log(chainData.name);
  if (chainId !== 56)
    return alert("Connect wallet to a Binance Smart Chain Mainnet");
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  userAddress = selectedAccount;
  // selectedAccount = "0x51eB4417b7Ae83F752646BeDc512b2453b044883";
  showAddress(selectedAccount);
  tokenBalance(selectedAccount);
  ThoreumBalance(selectedAccount);
  CakeBalance(selectedAccount);
  disconnect.style.display = 'inline-block';
  console.log("selected-account", selectedAccount);
}

async function onConnect() {
  try {
    provider = await web3Modal.connect();
  } catch (e) {
    console.log("Could not get a wallet connection", e);
    return;
  }
  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });
  provider.on("chainChanged", (chainId) => {
    fetchAccountData();
  });

  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });
  await fetchAccountData();
}

function showAddress(num) {
  const firstAddressPart = shortener(num, 0, 6);
  const lastAddressPart = shortener(num, 36, 42);
  connect.innerHTML = `${firstAddressPart}...${lastAddressPart}`;
  document.querySelector(
    ".p_address"
  ).innerHTML = `${firstAddressPart}...${lastAddressPart}`;
}

const shortener = (_data, _start, _end) => {
  let result = "";
  for (let i = _start; i < _end; i++) result = [...result, _data[i]];

  return result.join("");
};

const tokenBalance = async (address) => {
  const web3 = new Web3(provider);
  let Contract = web3.eth.Contract;
  let contract = new Contract(Token_abi, Contract_address);
  let Token = await contract.methods.balanceOf(address).call(); // Token Balanceof User

  Token = Token / 10 ** 18;

  Token = parseFloat(Token).toFixed(2);
  Token = Token < 1 ? "0" : Token;

  document.querySelector(".token_balance").innerText =
    new Intl.NumberFormat().format(Token);
  document.querySelector(".token_balance_usd").innerText =
    new Intl.NumberFormat().format((Token * TokenPrice).toFixed(2));
};

const ThoreumBalance = async (address) => {
  const Token_abi = [
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const Contract_address = "0x580dE58c1BD593A43DaDcF0A739d504621817c05";
  const web3 = new Web3(provider);
  let Contract = web3.eth.Contract;
  let contract = new Contract(Token_abi, Contract_address);
  let Token = await contract.methods.balanceOf(address).call(); // Token Balanceof User

  Token = Token / 10 ** 18;

  Token = parseFloat(Token).toFixed(2);
  Token = Token < 1 ? "0" : Token;

  document.querySelector(".thoreum_balance").innerText =
    new Intl.NumberFormat().format(Token);
  document.querySelector(".thoreum_balance_usd").innerText =
    new Intl.NumberFormat().format((Token * ThoreumPrice).toFixed(2));
};

const CakeBalance = async (address) => {
  const Token_abi = [
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const Contract_address = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
  const web3 = new Web3(provider);
  let Contract = web3.eth.Contract;
  let contract = new Contract(Token_abi, Contract_address);
  let Token = await contract.methods.balanceOf(address).call(); // Token Balanceof User

  Token = Token / 10 ** 18;

  Token = parseFloat(Token).toFixed(2);
  Token = Token < 1 ? "0" : Token;

  document.querySelector(".cake_balance").innerText =
    new Intl.NumberFormat().format(Token);
  document.querySelector(".cake_balance_usd").innerText =
    new Intl.NumberFormat().format((Token * PanPrice).toFixed(2));
};

const Claim = async (address) => {
  const web3 = new Web3(Web3.givenProvider);
  let Contract = web3.eth.Contract;
  let contract = new Contract(Token_abi, Contract_address);

  if(userAddress){
    try {
      let claim = await contract.methods.claim().send({
        from: address,
        gas: 50000,
        gasPrice: "42000000000",
      });
  
      console.log("claim ", claim);
    } catch (err) {
      console.log("Canceled Transaction !");
    }
  }else{
    onConnect()
  }
};

const contractStat = async () => {
  const web3 = new Web3(Web3.givenProvider);
  let Contract = web3.eth.Contract;
  let contract = new Contract(Token_abi, Contract_address);

  try {
    let CR = await contract.methods.getTotalCakeDividendsDistributed().call(); // Cake Rewarded
    let TR = await contract.methods
      .getTotalThoreumDividendsDistributed()
      .call(); // Thoreum Rewarded
    let MS = await contract.methods.maxSellTransactionAmount().call(); // Max Sell
    let TB = await contract.methods.balanceOf(dead).call(); // Total Burned
    let TS = await contract.methods.totalSupply().call(); // Total Supply

    let TotalReward;
    let CS;

    CR = CR / 10 ** 18;
    TR = TR / 10 ** 18;
    MS = MS / 10 ** 18;
    TB = TB / 10 ** 18;
    TS = TS / 10 ** 18;

    CR = parseFloat(CR).toFixed(3);
    TR = parseFloat(TR).toFixed(3);
    TB = parseFloat(TB).toFixed(0);
    TS = parseFloat(TS).toFixed(0);

    CS = TS - TB;
    showPrice.innerHTML = TokenPrice;

    document.querySelector(".cr").innerHTML = new Intl.NumberFormat().format(
      CR
    );
    document.querySelector(".crd").innerHTML = new Intl.NumberFormat().format(
      (CR * PanPrice).toFixed(3)
    );

    document.querySelector(".tr").innerHTML = new Intl.NumberFormat().format(
      TR
    );
    document.querySelector(".trd").innerHTML = new Intl.NumberFormat().format(
      (TR * ThoreumPrice).toFixed(3)
    );

    TotalReward = Math.round(CR * PanPrice + TR * ThoreumPrice);

    document.querySelector(".ttr").innerHTML = new Intl.NumberFormat().format(
      TotalReward
    );
    document.querySelector(".Msell").innerHTML = new Intl.NumberFormat().format(
      MS
    );
    document.querySelector(".tb").innerHTML = new Intl.NumberFormat().format(
      100000000000 - CS
    );

    document.querySelector(".cs").innerHTML = new Intl.NumberFormat().format(
      CS
    );
    document.querySelector(".mc").innerHTML = new Intl.NumberFormat().format(
      Math.round(CS * TokenPrice)
    );
  } catch (err) {
    console.log(err);
  }
};

const allPrice = async (api, Tapi, Papi) => {
  TokenPrice = await Price(api);
  ThoreumPrice = await Price(Tapi);
  PanPrice = await Price(Papi);

  return true;
};

const Disconnect = () => {
  disconnect.style.display = 'none';
  connect.innerHTML= '<i class="fas fa-user"></i>connect';
  document.querySelector(
    ".p_address"
  ).innerHTML = " ";
  userAddress = null;
  document.querySelector(".cake_balance").innerText ="";
  document.querySelector(".cake_balance_usd").innerText ="";
  document.querySelector(".thoreum_balance").innerText ="";
  document.querySelector(".thoreum_balance_usd").innerText ="";
  document.querySelector(".token_balance").innerText ="";
  document.querySelector(".token_balance_usd").innerText ="";
}

window.addEventListener("load", () => {
  init();
  onConnect();

  setInterval(() => {
    allPrice(api, Tapi, Papi);
    if (TokenPrice) {
      contractStat();
    }
  }, 500);
});

connect.addEventListener("click", function () {
  onConnect();
});

disconnect.addEventListener("click" , function () {
  Disconnect()
})

claimbtn.addEventListener("click", () => {
  Claim(userAddress);
});
