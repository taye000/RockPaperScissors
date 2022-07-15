import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from "./build/index.main.mjs";

const stdlib = loadStdlib(process.env);

//defines a quantity of network tokens as the starting balance for each test account
const startingBalance = stdlib.parseCurrency(100);

//create test accounts with initial endowments for Alice and Bob.
//This will only work on the Reach-provided developer testing network
const accAlice = await stdlib.newTestAccount(startingBalance);
const accBob = await stdlib.newTestAccount(startingBalance);

//function for displaying currency amounts with up to 4 decimal places
const fmt = (x) => stdlib.formatCurrency(x, 4);

//function for getting the balance of a participant and displaying it with up to 4 decimal places
const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

//get the balance before the game starts for both Alice and Bob
const beforeAlice = await getBalance(accAlice);
const beforeBob = await getBalance(accBob);

//Alice deploy the application
const ctcAlice = accAlice.contract(backend);

//Bob attaches to deployed application
const ctcBob = accBob.contract(backend, ctcAlice.getInfo());

//define arrays to hold the meaning of the hands and outcomes.
const HAND = ["Rock", "Paper", "Scissors"];
const OUTCOME = ["Bob Wins", "Draw", "Alice Wins"];

//define a constructor for the Player implementation.
const Player = (Who) => ({
  getHand: () => {
    const hand = Math.floor(Math.random() * 3);
    console.log(`${Who} played ${HAND[hand]}`);
    return hand;
  },
  seeOutcome: (outcome) => {
    console.log(`${Who} saw outcome ${OUTCOME[outcome]}`);
  },
});

//wait for backends to complete
// then initialize backend for Alice & Bob
await Promise.all([
  ctcAlice.p.Alice({
    ...Player("Alice"),
    wager: stdlib.parseCurrency(5),
  }),
  ctcBob.p.Bob({
    ...Player("Bob"),
    accepWager: (amt) => {
      console.log(`Bob accepts the wager of ${fmt(amt)}.`);
    },
  }),
]);
//get balances after wagers
const afterAlice = await getBalance(accAlice);
const afterBob = await getBalance(accBob);

console.log(`Alice went from ${beforeAlice} to ${afterAlice}`);
console.log(`Bob went from ${beforeBob} to ${afterBob}`);
