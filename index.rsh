"reach 0.1";

//participant interact interface that will be shared between the two players.
//In this case, it provides two methods: getHand, which returns a number; and seeOutcome, which receives a number.
const Player = {
  getHand: Fun([], UInt),
  seeOutcome: Fun([UInt], Null),
};

//main export from the program. When you compile, this is what the compiler will look at.
export const main = Reach.App(() => {
  //specify the two participants to this application, Alice and Bob.
  const Alice = Participant("Alice", {
    ...Player,
    wager: UInt,
  });
  const Bob = Participant("Bob", {
    ...Player,
    acceptWager: Fun([UInt], Null),
  });
  init();

  //states that this block of code is something that only Alice performs.
  Alice.only(() => {
    const wager = declassify(interact.wager);
    const handAlice = declassify(interact.getHand());
  });
  //Alice join the application by publishing the value to the consensus network, so it can be used to evaluate the outcome of the game.
  //Once this happens, the code is in a "consensus step" where all participants act together.
  Alice.publish(wager, handAlice).pay(wager);

  //commits the state of the consensus network and returns to "local step" where individual participants can act alone.
  commit();

  //states that this block of code is something that only Bob performs.
  Bob.only(() => {
    interact.acceptWager(wager);
    const handBob = declassify(interact.getHand());
  });
  Bob.publish(handBob).pay(wager);

  //computes the outcome of the game before committing
  const outcome = (handAlice + (4 - handBob)) % 3;

  //compute the amounts given to each participant depending on the outcome by determining how many wager amounts each party gets
  const [forAlice, forBob] =
    outcome == 2 ? [2, 0] : outcome == 0 ? [0, 2] : /*tie*/ [1, 1];

  //transfer the corresponding amounts
  transfer(forAlice * wager).to(Alice);
  transfer(forBob * wager).to(Bob);

  commit();

  //local step that each of the participants perform
  each([Alice, Bob], () => {
    interact.seeOutcome(outcome);
  });
});
