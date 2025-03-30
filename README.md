# 🚀 BlockVest: A Decentralized Investment Platform

Blockvest is a decentralized investment platform built on the Ethereum blockchain. It allows project owners to raise funds by offering equity in exchange for investments. Investors can contribute to projects, and once the funding target is met, the project owner can withdraw the funds.

## 📚 Features
👉 Create a project with name, details, funding target, and equity offered.  
👉 Invest in a project until the funding target is met.  
👉 Track how much each investor has contributed.  
👉 Withdraw funds once the project is fully funded and closed.  
👉 Retrieve project details and investment information easily.  

## 🛠️ How to Run the Project

### ⚡ 1. Install Foundry
Make sure you have Foundry installed:
```
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### ⚡ 2. Clone the Repository
```
git clone https://github.com/your-repo/blockvest.git
cd BlockVest
```

### ⚡ 3. Install Dependencies
```
npm install
forge install
```

### ⚡ 4. Compile the Smart Contract
```
cd foundry
forge build
```

### ⚡ 5. Setup Environment Variables
Create a `.env` file in the root folder:
```
cd ..
touch .env
```
Add the following content to your `.env` file:
```
NEXT_PUBLIC_CHAIN=anvil
RPC_URL=127.0.0.1:8545
```

### ⚡ 6. Create a Wallet
To import your wallet:
```
cast wallet import --interactive
```
To check if the wallet is imported successfully:
```
cast wallet list
```
Your wallet should be listed there.

### ⚡ 7. Start Local Testnet
Open another terminal tab and run:
```
anvil
```

### ⚡ 8. Deploy Smart Contract on Local Testnet
```
forge script script/Blockvest.s.sol --rpc-url $RPC_URL --account accountname --sender -x1239accountaddress --broadcast
```

### ⚡ 9. Run the Platform
```
npm run dev
```

### ⚡ 10. Open Platform in Browser
Open any browser and go to:
```
http://localhost:3000
```

## 📢 Security Considerations
🚨 Ensure that private keys are kept secure and never hardcoded in any script.  
🚨 Double-check configurations before deploying to a live network.  

## 🤝 Contributing
Feel free to fork, submit pull requests, or open issues! Contributions are always welcome.  

## 📝 License
This project is licensed under the [MIT License](LICENSE).

## 💎 Contact
For any questions or assistance, feel free to contact us. 😊

