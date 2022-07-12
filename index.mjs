import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";

const stdlib = loadStdlib();

//defines a quantity of network tokens as the starting balance for each test account
const startingBalance = stdlib.parseCurrency(100);

//create test accounts with initial endowments for Alice and Bob.
//This will only work on the Reach-provided developer testing network
const accAlice = await stdlib.newTestAccount(startingBalance);
const accBob = await stdlib.newTestAccount(startingBalance);

//Alice deploy the application
const ctcAlice = accAlice.contract(backend);

//Bob attaches to deployed application
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

//define arrays to hold the meaning of the hands and outcomes.
const HAND = ["Rock", "Paper", "Scissors"];
const OUTCOME = ["Bob Wins", "Draw", "Alice Wins"];

//define a constructor for the Player implementation.
const Player = (who) => ({
  getHand: () => {
    const hand = Math.floor() * 3;
    console.log(`&{who} played ${HAND[hand]}`);
    return hand;
  },
  seeOutcome: (outcome) => {
    console.log(`${who} saw outcome ${OUTCOME[outcome]}`);
  },
});

//wait for backends to complete
await Promise.all([
  //initialize backend for Alice & Bob
  ctcAlice.p.Alice({
    //implement Alice's interact object here
  }),
  ctcBob.p.Bob({
    //implement Bob's interact object here
  }),
]);
