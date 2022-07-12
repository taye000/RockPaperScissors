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
  });
  const Bob = Participant("Bob", {
    ...Player,
  });
  init();

  //states that this block of code is something that only Alice performs.
  Alice.only(() => {
    const handAlice = declassify(interact.getHand());
  });
  //Alice join the application by publishing the value to the consensus network, so it can be used to evaluate the outcome of the game.
  //Once this happens, the code is in a "consensus step" where all participants act together.
  Alice.publish(handAlice);

  //commits the state of the consensus network and returns to "local step" where individual participants can act alone.
  commit();

  //states that this block of code is something that only Bob performs.
  Bob.only(() => {
    const handBob = declassify(interact.getHand());
  });
  Bob.publish(handBob);

  //computes the outcome of the game before committing
  const outcome = (handAlice + (4 - handBob)) % 3;
  commit();
});
