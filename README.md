# BlockVest
# A decentralized investment platform
Blockvest is a decentralized investment platform built on the Ethereum blockchain. It allows project owners to raise funds by offering equity in exchange for investments. Investors can contribute to projects, and once the funding target is met, the project owner can withdraw the funds.
# Features
✅ Create a project with name, details, funding target, and equity offered.
✅ Invest in a project until the funding target is met.
✅ Track how much each investor has contributed.
✅ Withdraw funds once the project is fully funded and closed.
✅ Retrieve project details and investment information easily.
# How to run the project
1. Make sure you have Foundry installed-
$ curl -L https://foundry.paradigm.xyz | bash
foundryup
2. Clone the repository
$ git clone https://github.com/your-repo/blockvest.git
$ cd BlockVest
3. Install dependencies
$ npm install
$ forge install
4. Compile the Smart Contract
$ cd foundry
$ forge build
5. Setup environment variables
Create a .env file in root folder
$ cd ..
$ touch .env
In .env file, write this-
NEXT_PUBLIC_CHAIN=anvil
RPC_URL=127.0.0.1:8545
6. Create a wallet
$ cast wallet import --interactive
After importing your wallet, to check it-
$ cast wallet list
Your wallet should be listed there.
7. Start local testnet
Open another tab in terminal-
$ anvil
8. To deploy Smart Contract on local testnet
$ forge script script/Blockvest.s.sol --rpc-url $RPC_URL --
account accountname --sender -x1239accountaddress --
broadcast
9. Run the platform
$ npm run dev
10. To see the platform go to any web browser and search
localhost:3000




